/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Program } from './entities/program.entity';
import { Fase } from './entities/fase.entity';
import { Kegiatans } from './entities/kegiatans.entity';
import { Termin } from './entities/termin.entity';
import { PersyaratanTermin } from './entities/persyaratan-termin.entity';
import { PersyaratanKegiatan } from './entities/persyaratan-kegiatan.entity';
import { DokumenProgram } from './entities/dokumen-program.entity';

import { CreateProgramDto } from './dto/create-program.dto';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,

    @InjectRepository(Fase)
    private readonly faseRepo: Repository<Fase>,

    @InjectRepository(Kegiatans)
    private readonly kegiatansRepo: Repository<Kegiatans>,

    @InjectRepository(Termin)
    private readonly terminRepo: Repository<Termin>,

    @InjectRepository(PersyaratanTermin)
    private readonly persyaratanTerminRepo: Repository<PersyaratanTermin>,

    @InjectRepository(PersyaratanKegiatan)
    private readonly persyaratanKegiatanRepo: Repository<PersyaratanKegiatan>,

    @InjectRepository(DokumenProgram)
    private readonly dokumenProgramRepo: Repository<DokumenProgram>,
  ) {}

  private toNumber(value: any, fallback: any = null) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  private toArray(value: any): number[] {
    if (Array.isArray(value)) {
      return value.map(Number).filter((item) => !Number.isNaN(item));
    }

    if (typeof value === 'string' && value.trim() !== '') {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed.map(Number).filter((item) => !Number.isNaN(item));
        }
      } catch {
        return value
          .split(',')
          .map((item) => Number(item.trim()))
          .filter((item) => !Number.isNaN(item));
      }
    }

    if (typeof value === 'number') return [value];

    return [];
  }

  private parseFases(value: any) {
    if (Array.isArray(value)) return value;

    if (typeof value === 'string' && value.trim() !== '') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }

  async create(
    createProgramDto: CreateProgramDto,
    file: Express.Multer.File,
    id_user: number,
  ) {
    const queryRunner = this.programRepo.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('--- [DEBUG CREATE PROGRAM] ---');
      console.log('DTO:', createProgramDto);
      console.log('FILE:', file ? file.filename : 'TIDAK ADA FILE');
      console.log('USER:', id_user);

      const sekolahIds = this.toArray(createProgramDto.sekolah_ids);
      const aoIds = this.toArray(createProgramDto.ao_ids);
      const vendorIds = this.toArray(
        createProgramDto.vendor_ids?.length
          ? createProgramDto.vendor_ids
          : createProgramDto.id_vendor,
      );

      const idSekolah =
        this.toNumber(createProgramDto.id_sekolah) || sekolahIds[0] || null;

      const idPengawas =
        this.toNumber(createProgramDto.id_pengawas) || aoIds[0] || null;

      if (!idSekolah) {
        throw new Error('id_sekolah tidak valid');
      }

      if (!idPengawas) {
        throw new Error('id_pengawas tidak valid');
      }

      const program = this.programRepo.create({
        nama_program: createProgramDto.nama_program,
        deskripsi: createProgramDto.deskripsi || null,

        id_sekolah: idSekolah,
        id_pengawas: idPengawas,

        id_vendor: vendorIds,
        vendor_ids: vendorIds,
        sekolah_ids: sekolahIds.length ? sekolahIds : [idSekolah],
        ao_ids: aoIds.length ? aoIds : [idPengawas],

        kategori: createProgramDto.kategori,
        tahun: this.toNumber(createProgramDto.tahun),
        tanggal_mulai: createProgramDto.tanggal_mulai
          ? new Date(createProgramDto.tanggal_mulai)
          : null,
        tanggal_selesai: createProgramDto.tanggal_selesai
          ? new Date(createProgramDto.tanggal_selesai)
          : null,

        status_program: createProgramDto.status_program || 'Approval',
        dibuat_oleh: id_user,

        file_mou: file ? file.filename : null,

        nomor_mou: createProgramDto.nomor_mou || null,
        harga_vendor: this.toNumber(createProgramDto.harga_vendor, 0),

        kpi_nama: createProgramDto.kpi_nama || null,
        kpi_target: this.toNumber(createProgramDto.kpi_target, 0),
        kpi_satuan: createProgramDto.kpi_satuan || null,
      });

      const savedProgram = await queryRunner.manager.save(Program, program);

      if (file) {
        const dokumen = this.dokumenProgramRepo.create({
          id_program: savedProgram.id_program,
          jenis_dokumen: 'MOU',
          nama_file: file.originalname,
          file_path: file.filename,
          upload_by: id_user,
        });

        await queryRunner.manager.save(DokumenProgram, dokumen);
      }

      console.log('FASES RAW:', createProgramDto.fases);
      console.log('FASES RAW TYPE:', typeof createProgramDto.fases);
      console.log('FASES RAW IS ARRAY:', Array.isArray(createProgramDto.fases));

      const fases = this.parseFases(createProgramDto.fases);

      console.log('FASES PARSED:', fases);
      console.log('FASES PARSED LENGTH:', fases.length);

      for (let faseIndex = 0; faseIndex < fases.length; faseIndex++) {
        const fData = fases[faseIndex];

        if (!fData?.nama_fase?.trim()) {
          console.warn('Fase kosong dilewati:', fData);
          continue;
        }

        const fase = this.faseRepo.create({
          nama_fase: fData.nama_fase.trim(),
          deskripsi: fData.deskripsi || null,
          urutan: this.toNumber(fData.urutan, faseIndex + 1),
          id_program: savedProgram.id_program,
        });

        const savedFase = await queryRunner.manager.save(Fase, fase);

        const terminList = Array.isArray(fData.termin) ? fData.termin : [];

        for (
          let terminIndex = 0;
          terminIndex < terminList.length;
          terminIndex++
        ) {
          const tData = terminList[terminIndex];

          if (!tData?.nama_termin?.trim()) {
            console.warn('Termin kosong dilewati:', tData);
            continue;
          }

          const termin = this.terminRepo.create({
            nama_termin: tData.nama_termin.trim(),
            deskripsi: tData.deskripsi || null,
            jumlah_pembayaran: this.toNumber(tData.jumlah_pembayaran, 0),
            status: 'WAITING_UPLOAD',
            id_fase: savedFase.id_fase,
            id_kegiatans: null,
          });

          const savedTermin = await queryRunner.manager.save(Termin, termin);

          const persyaratanTermin = Array.isArray(tData.persyaratan)
            ? tData.persyaratan
            : [];

          for (
            let syaratIndex = 0;
            syaratIndex < persyaratanTermin.length;
            syaratIndex++
          ) {
            const req = persyaratanTermin[syaratIndex];

            if (!req?.nama?.trim()) {
              console.warn('Persyaratan termin kosong dilewati:', req);
              continue;
            }

            const persyaratan = this.persyaratanTerminRepo.create({
              id_termin: savedTermin.id_termin,
              nama: req.nama.trim(),
              tipe: req.tipe || 'upload',
              deskripsi: req.deskripsi || null,
              urutan: this.toNumber(req.urutan, syaratIndex + 1),
              status: 'WAITING_UPLOAD',
            });

            await queryRunner.manager.save(PersyaratanTermin, persyaratan);
          }
        }

        const kegiatanList = Array.isArray(fData.kegiatans)
          ? fData.kegiatans
          : [];

        for (
          let kegiatanIndex = 0;
          kegiatanIndex < kegiatanList.length;
          kegiatanIndex++
        ) {
          const kegData = kegiatanList[kegiatanIndex];

          if (!kegData?.nama_kegiatans?.trim()) {
            console.warn('Kegiatan kosong dilewati:', kegData);
            continue;
          }

          const kegiatan = this.kegiatansRepo.create({
            nama_kegiatans: kegData.nama_kegiatans.trim(),
            deskripsi: kegData.deskripsi || null,
            urutan: this.toNumber(kegData.urutan, kegiatanIndex + 1),
            id_fase: savedFase.id_fase,
          });

          const savedKegiatan = await queryRunner.manager.save(
            Kegiatans,
            kegiatan,
          );

          const persyaratanKegiatan = Array.isArray(kegData.persyaratan)
            ? kegData.persyaratan
            : [];

          for (
            let syaratIndex = 0;
            syaratIndex < persyaratanKegiatan.length;
            syaratIndex++
          ) {
            const req = persyaratanKegiatan[syaratIndex];

            if (!req?.nama?.trim()) {
              console.warn('Persyaratan kegiatan kosong dilewati:', req);
              continue;
            }

            const persyaratan = this.persyaratanKegiatanRepo.create({
              id_kegiatans: savedKegiatan.id_kegiatans,
              nama: req.nama.trim(),
              tipe: req.tipe || 'upload',
              deskripsi: req.deskripsi || null,
              urutan: this.toNumber(req.urutan, syaratIndex + 1),
              status: 'WAITING_UPLOAD',
            });

            await queryRunner.manager.save(PersyaratanKegiatan, persyaratan);
          }
        }
      }

      await queryRunner.commitTransaction();

      return this.findOne(savedProgram.id_program);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      console.error('--- [ERROR CREATE PROGRAM] ---');
      console.error(error);

      throw new InternalServerErrorException(
        `Gagal simpan program: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(kategori?: string) {
    try {
      return await this.programRepo.find({
        where: kategori ? { kategori } : {},
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      console.error('--- [ERROR DATABASE FINDALL] ---', error.message);
      throw new InternalServerErrorException('Gagal mengambil data program');
    }
  }

  async findOne(id: number) {
    try {
      return await this.programRepo.findOne({
        where: { id_program: id },
        relations: [
          'fases',
          'fases.termin',
          'fases.termin.persyaratan',
          'fases.termin.chats',
          'fases.kegiatans',
          'fases.kegiatans.persyaratan',
          'fases.kegiatans.termin',
          'fases.kegiatans.termin.chats',
        ],
        order: {
          fases: {
            urutan: 'ASC',
            termin: {
              created_at: 'ASC',
              persyaratan: {
                urutan: 'ASC',
              },
            },
            kegiatans: {
              urutan: 'ASC',
              persyaratan: {
                urutan: 'ASC',
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('--- [ERROR FINDONE PROGRAM] ---', error.message);
      throw new InternalServerErrorException('Data program tidak ditemukan');
    }
  }

  async uploadPersyaratanTermin(
    id_persyaratan: number,
    file: Express.Multer.File,
    body: any,
    id_user: number,
  ) {
    const persyaratan = await this.persyaratanTerminRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan termin tidak ditemukan');
    }

    if (persyaratan.tipe === 'upload' && !file) {
      throw new BadRequestException('File wajib diupload');
    }

    persyaratan.status = 'WAITING_HO';
    persyaratan.updated_at = new Date();

    if (file) {
      persyaratan.file_path = file.filename;
      persyaratan.nama_file = file.originalname;
    }

    await this.persyaratanTerminRepo.save(persyaratan);

    return {
      message: 'Bukti persyaratan termin berhasil dikirim ke HO',
      data: persyaratan,
    };
  }

  async uploadPersyaratanKegiatan(
    id_persyaratan: number,
    file: Express.Multer.File,
    body: any,
    id_user: number,
  ) {
    const persyaratan = await this.persyaratanKegiatanRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan kegiatan tidak ditemukan');
    }

    if (persyaratan.tipe === 'upload' && !file) {
      throw new BadRequestException('File wajib diupload');
    }

    persyaratan.status = 'WAITING_HO';
    persyaratan.updated_at = new Date();

    if (file) {
      persyaratan.file_path = file.filename;
      persyaratan.nama_file = file.originalname;
    }

    await this.persyaratanKegiatanRepo.save(persyaratan);

    return {
      message: 'Bukti persyaratan kegiatan berhasil dikirim ke HO',
      data: persyaratan,
    };
  }

  async approvePersyaratanTermin(id_persyaratan: number, id_user: number) {
    const persyaratan = await this.persyaratanTerminRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan termin tidak ditemukan');
    }

    if (persyaratan.status !== 'WAITING_HO') {
      throw new BadRequestException(
        'Persyaratan belum dalam status menunggu validasi HO',
      );
    }

    persyaratan.status = 'APPROVED';
    persyaratan.updated_at = new Date();

    await this.persyaratanTerminRepo.save(persyaratan);

    return {
      message: 'Persyaratan termin berhasil di-ACC',
      data: persyaratan,
    };
  }

  async rejectPersyaratanTermin(
    id_persyaratan: number,
    id_user: number,
    body: any,
  ) {
    const persyaratan = await this.persyaratanTerminRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan termin tidak ditemukan');
    }

    if (persyaratan.status !== 'WAITING_HO') {
      throw new BadRequestException(
        'Persyaratan belum dalam status menunggu validasi HO',
      );
    }

    persyaratan.status = 'REJECTED';
    persyaratan.updated_at = new Date();

    await this.persyaratanTerminRepo.save(persyaratan);

    return {
      message: 'Persyaratan termin berhasil ditolak',
      alasan: body?.alasan || body?.reason || null,
      data: persyaratan,
    };
  }

  async approvePersyaratanKegiatan(id_persyaratan: number, id_user: number) {
    const persyaratan = await this.persyaratanKegiatanRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan kegiatan tidak ditemukan');
    }

    if (persyaratan.status !== 'WAITING_HO') {
      throw new BadRequestException(
        'Persyaratan belum dalam status menunggu validasi HO',
      );
    }

    persyaratan.status = 'APPROVED';
    persyaratan.updated_at = new Date();

    await this.persyaratanKegiatanRepo.save(persyaratan);

    return {
      message: 'Persyaratan kegiatan berhasil di-ACC',
      data: persyaratan,
    };
  }

  async rejectPersyaratanKegiatan(
    id_persyaratan: number,
    id_user: number,
    body: any,
  ) {
    const persyaratan = await this.persyaratanKegiatanRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan kegiatan tidak ditemukan');
    }

    if (persyaratan.status !== 'WAITING_HO') {
      throw new BadRequestException(
        'Persyaratan belum dalam status menunggu validasi HO',
      );
    }

    persyaratan.status = 'REJECTED';
    persyaratan.updated_at = new Date();

    await this.persyaratanKegiatanRepo.save(persyaratan);

    return {
      message: 'Persyaratan kegiatan berhasil ditolak',
      alasan: body?.alasan || body?.reason || null,
      data: persyaratan,
    };
  }

  async update(
    id: number,
    updateData: any,
    file: Express.Multer.File,
    id_user: number,
  ) {
    try {
      const dataToSave = { ...updateData };

      if (file) {
        dataToSave.file_mou = file.filename;
      }

      await this.programRepo.update(id, dataToSave);

      return this.findOne(id);
    } catch (error) {
      console.error('--- [ERROR UPDATE PROGRAM] ---', error.message);
      throw new InternalServerErrorException('Gagal update program');
    }
  }

  remove(id: number) {
    return this.programRepo.delete(id);
  }
}
