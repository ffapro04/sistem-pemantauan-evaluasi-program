/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.entity';
import { UsersService } from '../users/users.service';
import type { VendorDocumentFiles } from './vendor.controller';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { parsePagination, toPaginatedResult } from '../common/pagination.util';

type CurrentUploadUser = {
  id_user: number | null;
  id_role: number | null;
};

const VENDOR_DOCUMENT_FIELDS = [
  'npwp_file',
  'buku_rekening_file',
  'ktp_pj_file',
  'akta_notaris_file',
] as const;

type VendorDocumentField = (typeof VENDOR_DOCUMENT_FIELDS)[number];
type VendorDocumentMap = Partial<Record<VendorDocumentField, string>>;

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);

  constructor(
    @InjectRepository(Vendor)
    private vendorRepo: Repository<Vendor>,

    private usersService: UsersService,

    private googleDriveService: GoogleDriveService,
  ) {}

  private getUploadedFile(
    files: VendorDocumentFiles | undefined,
    fieldName: keyof VendorDocumentFiles,
  ): Express.Multer.File | undefined {
    return files?.[fieldName]?.[0];
  }

  private getDriveFilePath(uploaded: any, fallback: string) {
    const driveFile = uploaded?.file;

    return (
      driveFile?.web_view_link ||
      driveFile?.web_content_link ||
      driveFile?.drive_file_id ||
      uploaded?.path ||
      fallback
    );
  }

  private async uploadVendorDocuments(
    files: VendorDocumentFiles | undefined,
    currentUser?: CurrentUploadUser,
  ): Promise<VendorDocumentMap> {
    const uploadItems = VENDOR_DOCUMENT_FIELDS.map((fieldName) => ({
      fieldName,
      file: this.getUploadedFile(files, fieldName),
    })).filter((item) => item.file);

    if (uploadItems.length === 0) return {};

    if (!currentUser?.id_user) {
      return uploadItems.reduce<VendorDocumentMap>((result, item) => {
        this.logger.warn(
          `VENDOR_DOCUMENT_FALLBACK_NO_USER:${String(item.fieldName)}:${item.file?.originalname}`,
        );
        result[item.fieldName] = item.file?.originalname || '';
        return result;
      }, {});
    }

    try {
      const uploadedFiles = await this.googleDriveService.uploadFiles({
        idUser: currentUser.id_user,
        idRole: currentUser.id_role || null,
        files: uploadItems.map((item) => ({
          file: item.file,
          moduleType: `VENDOR_${String(item.fieldName).toUpperCase()}`,
          relatedTable: 'm_vendor',
          relatedId: null,
        })),
      });

      return uploadItems.reduce<VendorDocumentMap>((result, item, index) => {
        result[item.fieldName] = this.getDriveFilePath(
          uploadedFiles[index],
          item.file?.originalname || '',
        );
        return result;
      }, {});
    } catch (error) {
      return uploadItems.reduce<VendorDocumentMap>((result, item) => {
        this.logger.warn(
          `VENDOR_DOCUMENT_DRIVE_FALLBACK:${String(item.fieldName)}:${(error as Error)?.message || error}`,
        );
        result[item.fieldName] = item.file?.originalname || '';
        return result;
      }, {});
    }
  }

  private toNumber(value: any, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private average(values: number[]) {
    const validValues = values.filter((value) => Number.isFinite(value));
    if (validValues.length === 0) return 0;

    return (
      validValues.reduce((total, value) => total + value, 0) /
      validValues.length
    );
  }

  private getVendorGrade(score: number) {
    if (score >= 90) return 'Sangat Baik';
    if (score >= 75) return 'Baik';
    if (score >= 60) return 'Perlu Perhatian';
    return 'Berisiko';
  }

  async create(
    createVendorDto: CreateVendorDto,
    files?: VendorDocumentFiles,
    currentUser?: CurrentUploadUser,
  ) {
    try {
      const uploadedDocuments = await this.uploadVendorDocuments(
        files,
        currentUser,
      );

      const npwpFile =
        uploadedDocuments.npwp_file ||
        createVendorDto.npwp_file ||
        null;

      const bukuRekeningFile =
        uploadedDocuments.buku_rekening_file ||
        createVendorDto.buku_rekening_file ||
        null;

      if (!npwpFile) {
        throw new BadRequestException('Dokumen NPWP wajib diunggah.');
      }

      if (!bukuRekeningFile) {
        throw new BadRequestException('Buku Rekening wajib diunggah.');
      }

      const userBaru = await this.usersService.create({
        nama: createVendorDto.pj_1,
        email: createVendorDto.email,
        password: createVendorDto.password,
        jabatan: 'Vendor Partner',
        id_role: 6,
        status: true,
      });

      const vendorBaru = this.vendorRepo.create({
        nama_vendor: createVendorDto.nama_vendor,
        no_register: createVendorDto.no_register || null,
        pj_1: createVendorDto.pj_1,
        telp_pj_1: createVendorDto.telp_pj_1,
        pj_2: createVendorDto.pj_2 || null,
        telp_pj_2: createVendorDto.telp_pj_2 || null,
        pilar: createVendorDto.pilar,
        alamat: createVendorDto.alamat || null,
        status: 'Bermitra',
        user: userBaru,

        npwp_file: npwpFile,

        buku_rekening_file: bukuRekeningFile,

        ktp_pj_file:
          uploadedDocuments.ktp_pj_file || createVendorDto.ktp_pj_file || null,

        akta_notaris_file:
          uploadedDocuments.akta_notaris_file ||
          createVendorDto.akta_notaris_file ||
          null,
      });

      return await this.vendorRepo.save(vendorBaru);
    } catch (error) {
      this.logger.error('ERROR_CREATE_VENDOR:', error?.message || error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Gagal mendaftarkan vendor.');
    }
  }

  async findAll(page?: string, limit?: string) {
    const pagination = parsePagination(page, limit);

    if (!pagination) {
      return await this.vendorRepo.find({
        relations: ['user'],
        order: {
          nama_vendor: 'ASC',
        },
      });
    }

    const [vendors, total] = await this.vendorRepo.findAndCount({
      relations: ['user'],
      order: {
        nama_vendor: 'ASC',
      },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    return toPaginatedResult(vendors, total, pagination);
  }

  async findOne(id: number) {
    const vendor = await this.vendorRepo
      .createQueryBuilder('vendor')
      .leftJoinAndSelect('vendor.user', 'user')
      .addSelect('user.password')
      .where('vendor.id_vendor = :id', { id })
      .getOne();

    if (!vendor) {
      throw new NotFoundException(`Vendor #${id} tidak ditemukan`);
    }

    return {
      ...vendor,
      email: vendor.user?.email || '',
      password: (vendor.user as any)?.password || '',
    };
  }

  async getManagementSummary() {
    const manager = this.vendorRepo.manager;

    const vendors = await this.vendorRepo.find({
      relations: ['user'],
      order: {
        nama_vendor: 'ASC',
      },
    });

    const rows = await Promise.all(
      vendors.map(async (vendor) => {
        const vendorId = Number(vendor.id_vendor);

        const programs = await manager.query(
          `
            SELECT
              p.id_program,
              p.nama_program,
              p.kategori,
              p.pilar_program,
              p.tahun,
              p.status_program,
              COALESCE(p.harga_vendor, 0)::numeric AS harga_vendor,
              COUNT(DISTINCT k.id_kegiatans)::int AS total_kegiatan,
              COUNT(DISTINCT pk.id_persyaratan)::int AS total_bukti_kegiatan,
              COUNT(DISTINCT pt.id_persyaratan)::int AS total_bukti_administrasi,
              COUNT(DISTINCT CASE
                WHEN pk.status = 'APPROVED' THEN pk.id_persyaratan
              END)::int AS kegiatan_approved,
              COUNT(DISTINCT CASE
                WHEN pt.status = 'APPROVED' THEN pt.id_persyaratan
              END)::int AS administrasi_approved,
              COUNT(DISTINCT CASE
                WHEN pk.status = 'REJECTED'
                  OR pk.ao_rejected_at IS NOT NULL
                  OR pk.rejected_at IS NOT NULL
                THEN pk.id_persyaratan
              END)::int AS kegiatan_rejected,
              COUNT(DISTINCT CASE
                WHEN pt.status = 'REJECTED'
                  OR pt.ao_rejected_at IS NOT NULL
                  OR pt.rejected_at IS NOT NULL
                THEN pt.id_persyaratan
              END)::int AS administrasi_rejected,
              COUNT(DISTINCT CASE
                WHEN pk.uploaded_at IS NOT NULL
                  AND k.tanggal_selesai IS NOT NULL
                  AND pk.uploaded_at::date > k.tanggal_selesai::date
                THEN pk.id_persyaratan
              END)::int AS kegiatan_late,
              COUNT(DISTINCT CASE
                WHEN pt.uploaded_at IS NOT NULL
                  AND first_kegiatan.tanggal_mulai IS NOT NULL
                  AND pt.uploaded_at::date > first_kegiatan.tanggal_mulai::date
                THEN pt.id_persyaratan
              END)::int AS administrasi_late,
              COALESCE(AVG(kr.rating), 0)::numeric AS average_rating,
              COUNT(DISTINCT kr.id_rating)::int AS total_rating
            FROM t_program p
            LEFT JOIN t_fase f ON f.id_program = p.id_program
            LEFT JOIN t_kegiatans k ON k.id_fase = f.id_fase
            LEFT JOIN t_persyaratan_kegiatan pk ON pk.id_kegiatans = k.id_kegiatans
            LEFT JOIN t_termin t ON t.id_fase = f.id_fase
            LEFT JOIN t_persyaratan_termin pt ON pt.id_termin = t.id_termin
            LEFT JOIN LATERAL (
              SELECT k2.tanggal_mulai
              FROM t_kegiatans k2
              WHERE k2.id_fase = f.id_fase
              ORDER BY k2.tanggal_mulai ASC NULLS LAST, k2.id_kegiatans ASC
              LIMIT 1
            ) first_kegiatan ON TRUE
            LEFT JOIN t_kegiatan_rating kr ON kr.id_kegiatans = k.id_kegiatans
            WHERE $1 = ANY(COALESCE(p.vendor_ids, p.id_vendor, '{}'::int[]))
            GROUP BY
              p.id_program,
              p.nama_program,
              p.kategori,
              p.pilar_program,
              p.tahun,
              p.status_program,
              p.harga_vendor
            ORDER BY p.tahun DESC NULLS LAST, p.id_program DESC
          `,
          [vendorId],
        );

        const programCount = programs.length;

        const totalBudget = programs.reduce(
          (total: number, program: any) =>
            total + this.toNumber(program.harga_vendor, 0),
          0,
        );

        const totalEvidence = programs.reduce(
          (total: number, program: any) =>
            total +
            this.toNumber(program.total_bukti_kegiatan, 0) +
            this.toNumber(program.total_bukti_administrasi, 0),
          0,
        );

        const approvedEvidence = programs.reduce(
          (total: number, program: any) =>
            total +
            this.toNumber(program.kegiatan_approved, 0) +
            this.toNumber(program.administrasi_approved, 0),
          0,
        );

        const rejectedEvidence = programs.reduce(
          (total: number, program: any) =>
            total +
            this.toNumber(program.kegiatan_rejected, 0) +
            this.toNumber(program.administrasi_rejected, 0),
          0,
        );

        const lateEvidence = programs.reduce(
          (total: number, program: any) =>
            total +
            this.toNumber(program.kegiatan_late, 0) +
            this.toNumber(program.administrasi_late, 0),
          0,
        );

        const totalRating = programs.reduce(
          (total: number, program: any) =>
            total + this.toNumber(program.total_rating, 0),
          0,
        );

        const averageRating = this.average(
          programs
            .filter(
              (program: any) => this.toNumber(program.total_rating, 0) > 0,
            )
            .map((program: any) => this.toNumber(program.average_rating, 0)),
        );

        const completionScore =
          totalEvidence > 0 ? (approvedEvidence / totalEvidence) * 100 : 100;

        const rejectionPenalty =
          totalEvidence > 0 ? (rejectedEvidence / totalEvidence) * 28 : 0;

        const latePenalty =
          totalEvidence > 0 ? (lateEvidence / totalEvidence) * 22 : 0;

        const ratingScore =
          totalRating > 0 ? (averageRating / 5) * 100 : completionScore;

        const rawScore =
          completionScore * 0.45 +
          ratingScore * 0.35 +
          20 -
          rejectionPenalty -
          latePenalty;

        const score = Math.max(0, Math.min(100, Math.round(rawScore)));

        if (vendor.user) {
          delete (vendor.user as any).password;
        }

        return {
          id_vendor: vendor.id_vendor,
          nama_vendor: vendor.nama_vendor,
          no_register: vendor.no_register,
          pilar: vendor.pilar,
          status: vendor.status,
          pj_1: vendor.pj_1,
          telp_pj_1: vendor.telp_pj_1,
          user: vendor.user,
          total_program: programCount,
          total_budget: totalBudget,
          total_evidence: totalEvidence,
          approved_evidence: approvedEvidence,
          rejected_evidence: rejectedEvidence,
          late_evidence: lateEvidence,
          average_rating: Number(averageRating.toFixed(2)),
          total_rating: totalRating,
          performance_score: score,
          performance_label: this.getVendorGrade(score),
          programs: programs.map((program: any) => {
            const programEvidence =
              this.toNumber(program.total_bukti_kegiatan, 0) +
              this.toNumber(program.total_bukti_administrasi, 0);

            const programApproved =
              this.toNumber(program.kegiatan_approved, 0) +
              this.toNumber(program.administrasi_approved, 0);

            const programRejected =
              this.toNumber(program.kegiatan_rejected, 0) +
              this.toNumber(program.administrasi_rejected, 0);

            const programLate =
              this.toNumber(program.kegiatan_late, 0) +
              this.toNumber(program.administrasi_late, 0);

            return {
              id_program: program.id_program,
              nama_program: program.nama_program,
              kategori: program.kategori,
              pilar_program: program.pilar_program,
              tahun: program.tahun,
              status_program: program.status_program,
              budget: this.toNumber(program.harga_vendor, 0),
              total_kegiatan: this.toNumber(program.total_kegiatan, 0),
              total_evidence: programEvidence,
              approved_evidence: programApproved,
              rejected_evidence: programRejected,
              late_evidence: programLate,
              completion_percentage:
                programEvidence > 0
                  ? Math.round((programApproved / programEvidence) * 100)
                  : 0,
              average_rating: Number(
                this.toNumber(program.average_rating, 0).toFixed(2),
              ),
              total_rating: this.toNumber(program.total_rating, 0),
            };
          }),
        };
      }),
    );

    const summary = {
      total_vendor: rows.length,
      active_vendor: rows.filter((row) =>
        String(row.status || '')
          .toLowerCase()
          .includes('bermitra'),
      ).length,
      total_program: rows.reduce(
        (total, row) => total + this.toNumber(row.total_program, 0),
        0,
      ),
      total_budget: rows.reduce(
        (total, row) => total + this.toNumber(row.total_budget, 0),
        0,
      ),
      average_score: Number(
        this.average(rows.map((row) => row.performance_score)).toFixed(2),
      ),
      average_rating: Number(
        this.average(
          rows
            .filter((row) => row.total_rating > 0)
            .map((row) => row.average_rating),
        ).toFixed(2),
      ),
    };

    return {
      summary,
      data: rows,
    };
  }

  async update(
    id: number,
    updateVendorDto: UpdateVendorDto,
    files?: VendorDocumentFiles,
    currentUser?: CurrentUploadUser,
  ) {
    try {
      const vendor = await this.vendorRepo.findOne({
        where: {
          id_vendor: id,
        },
        relations: ['user'],
      });

      if (!vendor) {
        throw new NotFoundException(`Vendor #${id} tidak ditemukan`);
      }

      const data = updateVendorDto as any;

      if (data.nama_vendor !== undefined) {
        vendor.nama_vendor = String(data.nama_vendor || '').trim();
      }

      if (data.no_register !== undefined) {
        vendor.no_register = data.no_register || null;
      }

      if (data.pj_1 !== undefined) {
        vendor.pj_1 = data.pj_1 || null;
      }

      if (data.telp_pj_1 !== undefined) {
        vendor.telp_pj_1 = data.telp_pj_1 || null;
      }

      if (data.pj_2 !== undefined) {
        vendor.pj_2 = data.pj_2 || null;
      }

      if (data.telp_pj_2 !== undefined) {
        vendor.telp_pj_2 = data.telp_pj_2 || null;
      }

      if (data.pilar !== undefined) {
        vendor.pilar = data.pilar || null;
      }

      if (data.alamat !== undefined) {
        vendor.alamat = data.alamat || null;
      }

      if (data.status !== undefined) {
        vendor.status = data.status || 'Bermitra';
      }

      const uploadedDocuments = await this.uploadVendorDocuments(
        files,
        currentUser,
      );

      const npwpFilename = uploadedDocuments.npwp_file;
      const bukuRekeningFilename = uploadedDocuments.buku_rekening_file;
      const ktpFilename = uploadedDocuments.ktp_pj_file;
      const aktaFilename = uploadedDocuments.akta_notaris_file;

      if (npwpFilename) {
        vendor.npwp_file = npwpFilename;
      } else if (data.npwp_file !== undefined && data.npwp_file !== '') {
        vendor.npwp_file = data.npwp_file;
      }

      if (bukuRekeningFilename) {
        vendor.buku_rekening_file = bukuRekeningFilename;
      } else if (
        data.buku_rekening_file !== undefined &&
        data.buku_rekening_file !== ''
      ) {
        vendor.buku_rekening_file = data.buku_rekening_file;
      }

      if (ktpFilename) {
        vendor.ktp_pj_file = ktpFilename;
      } else if (data.ktp_pj_file !== undefined && data.ktp_pj_file !== '') {
        vendor.ktp_pj_file = data.ktp_pj_file;
      }

      if (aktaFilename) {
        vendor.akta_notaris_file = aktaFilename;
      } else if (
        data.akta_notaris_file !== undefined &&
        data.akta_notaris_file !== ''
      ) {
        vendor.akta_notaris_file = data.akta_notaris_file;
      }

      const updatedVendor = await this.vendorRepo.save(vendor);

      if (updatedVendor.user?.id_user) {
        const userUpdate: any = {};

        if (data.email !== undefined && String(data.email).trim()) {
          userUpdate.email = String(data.email).trim();
        }

        if (data.password !== undefined && String(data.password).trim()) {
          userUpdate.password = String(data.password);
        }

        if (data.pj_1 !== undefined && String(data.pj_1).trim()) {
          userUpdate.nama = String(data.pj_1).trim();
        }

        if (Object.keys(userUpdate).length > 0) {
          await this.usersService.update(
            updatedVendor.user.id_user,
            userUpdate,
          );
        }
      }

      return await this.findOne(id);
    } catch (error) {
      this.logger.error('ERROR_UPDATE_VENDOR:', error?.message || error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Gagal memperbarui data vendor.');
    }
  }

  async remove(id: number) {
    const vendor = await this.findOne(id);

    await this.vendorRepo.delete(id);

    return {
      message: `Vendor ${vendor.nama_vendor} berhasil dihapus`,
    };
  }
}
