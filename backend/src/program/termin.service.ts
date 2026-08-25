/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { Vendor } from '../vendor/entities/vendor.entity';
import { Program } from './entities/program.entity';
import { Termin } from './entities/termin.entity';
import { TerminChat } from './entities/termin-chat.entity';

@Injectable()
export class TerminService {
  private readonly logger = new Logger(TerminService.name);

  constructor(
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,

    @InjectRepository(Termin)
    private readonly terminRepo: Repository<Termin>,

    @InjectRepository(TerminChat)
    private readonly chatRepo: Repository<TerminChat>,

    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,

    private readonly googleDriveService: GoogleDriveService,
  ) {}

  private toNumberOrNull(value: any) {
    if (value === undefined || value === null || value === '') return null;

    const numberValue = Number(value);

    return Number.isNaN(numberValue) ? null : numberValue;
  }

  private toNumberArray(value: any) {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value.map((item) => Number(item)).filter(Number.isFinite);
    }

    return String(value)
      .replace(/[{}[\]]/g, '')
      .split(',')
      .map((item) => Number(String(item).trim()))
      .filter(Number.isFinite);
  }

  private isElevatedChatUser(user: any) {
    const idRole = Number(user?.id_role || 0);
    const roleText = String(user?.role_user || '').toLowerCase();

    return (
      [1, 2, 3, 4].includes(idRole) ||
      roleText.includes('admin') ||
      roleText.includes('pengurus') ||
      roleText.includes('head office') ||
      roleText === 'ho' ||
      roleText.includes('area officer') ||
      roleText === 'ao'
    );
  }

  private isVendorChatUser(user: any) {
    const idRole = Number(user?.id_role || 0);
    const roleText = String(user?.role_user || '').toLowerCase();

    return (
      idRole === 6 ||
      roleText.includes('vendor') ||
      roleText.includes('narasumber')
    );
  }

  private getProgramVendorIds(program: Program) {
    return [
      ...this.toNumberArray((program as any).vendor_ids),
      ...this.toNumberArray((program as any).id_vendor),
    ].filter((value, index, array) => array.indexOf(value) === index);
  }

  private getProgramSchoolIds(program: Program) {
    const sekolahIds = this.toNumberArray((program as any).sekolah_ids);
    const primarySchoolId = this.toNumberOrNull((program as any).id_sekolah);

    return [
      ...sekolahIds,
      ...(primarySchoolId ? [primarySchoolId] : []),
    ].filter((value, index, array) => array.indexOf(value) === index);
  }

  private async getProgramIdFromFase(id_fase: number) {
    const rows = await this.programRepo.manager.query(
      'SELECT id_program FROM t_fase WHERE id_fase = $1 LIMIT 1',
      [id_fase],
    );

    return this.toNumberOrNull(rows?.[0]?.id_program);
  }

  private async getProgramIdFromKegiatan(id_kegiatans: number) {
    const rows = await this.programRepo.manager.query(
      `
        SELECT f.id_program
        FROM t_kegiatans k
        JOIN t_fase f ON f.id_fase = k.id_fase
        WHERE k.id_kegiatans = $1
        LIMIT 1
      `,
      [id_kegiatans],
    );

    return this.toNumberOrNull(rows?.[0]?.id_program);
  }

  private async getProgramIdFromTermin(id_termin: number) {
    const rows = await this.programRepo.manager.query(
      `
        SELECT COALESCE(tf.id_program, kf.id_program) AS id_program
        FROM t_termin t
        LEFT JOIN t_fase tf ON tf.id_fase = t.id_fase
        LEFT JOIN t_kegiatans k ON k.id_kegiatans = t.id_kegiatans
        LEFT JOIN t_fase kf ON kf.id_fase = k.id_fase
        WHERE t.id_termin = $1
        LIMIT 1
      `,
      [id_termin],
    );

    return this.toNumberOrNull(rows?.[0]?.id_program);
  }

  private async getProgramIdsFromRequirement(
    id_persyaratan: number,
    context: { id_termin?: number | null; id_kegiatans?: number | null },
  ) {
    const programIds = new Set<number>();

    if (!context.id_kegiatans) {
      const terminRows = await this.programRepo.manager.query(
        `
          SELECT COALESCE(tf.id_program, kf.id_program) AS id_program
          FROM t_persyaratan_termin p
          JOIN t_termin t ON t.id_termin = p.id_termin
          LEFT JOIN t_fase tf ON tf.id_fase = t.id_fase
          LEFT JOIN t_kegiatans k ON k.id_kegiatans = t.id_kegiatans
          LEFT JOIN t_fase kf ON kf.id_fase = k.id_fase
          WHERE p.id_persyaratan = $1
            AND ($2::int IS NULL OR p.id_termin = $2::int)
        `,
        [id_persyaratan, context.id_termin || null],
      );

      terminRows.forEach((row) => {
        const idProgram = this.toNumberOrNull(row?.id_program);
        if (idProgram) programIds.add(idProgram);
      });
    }

    if (!context.id_termin) {
      const kegiatanRows = await this.programRepo.manager.query(
        `
          SELECT f.id_program
          FROM t_persyaratan_kegiatan p
          JOIN t_kegiatans k ON k.id_kegiatans = p.id_kegiatans
          JOIN t_fase f ON f.id_fase = k.id_fase
          WHERE p.id_persyaratan = $1
            AND ($2::int IS NULL OR p.id_kegiatans = $2::int)
        `,
        [id_persyaratan, context.id_kegiatans || null],
      );

      kegiatanRows.forEach((row) => {
        const idProgram = this.toNumberOrNull(row?.id_program);
        if (idProgram) programIds.add(idProgram);
      });
    }

    return Array.from(programIds);
  }

  private async resolveProgramForChatContext(context: any) {
    const id_program = this.toNumberOrNull(context.id_program);
    const id_fase = this.toNumberOrNull(context.id_fase);
    const id_termin = this.toNumberOrNull(context.id_termin);
    const id_kegiatans = this.toNumberOrNull(context.id_kegiatans);
    const id_persyaratan = this.toNumberOrNull(context.id_persyaratan);

    const contextProgramIds = new Set<number>();

    if (id_program) contextProgramIds.add(id_program);

    if (id_fase) {
      const fromFase = await this.getProgramIdFromFase(id_fase);
      if (!fromFase) throw new BadRequestException('Fase chat tidak ditemukan.');
      contextProgramIds.add(fromFase);
    }

    if (id_kegiatans) {
      const fromKegiatan = await this.getProgramIdFromKegiatan(id_kegiatans);
      if (!fromKegiatan) {
        throw new BadRequestException('Aktivitas chat tidak ditemukan.');
      }
      contextProgramIds.add(fromKegiatan);
    }

    if (id_termin) {
      const fromTermin = await this.getProgramIdFromTermin(id_termin);
      if (!fromTermin) {
        throw new BadRequestException('Termin chat tidak ditemukan.');
      }
      contextProgramIds.add(fromTermin);
    }

    if (id_persyaratan) {
      const requirementProgramIds = await this.getProgramIdsFromRequirement(
        id_persyaratan,
        { id_termin, id_kegiatans },
      );

      if (!requirementProgramIds.length) {
        throw new BadRequestException('Bukti chat tidak ditemukan.');
      }

      requirementProgramIds.forEach((programId) =>
        contextProgramIds.add(programId),
      );
    }

    if (!contextProgramIds.size) {
      throw new BadRequestException(
        'Konteks chat tidak valid. Kirim id_program atau id_termin/id_kegiatans/id_persyaratan.',
      );
    }

    if (contextProgramIds.size > 1) {
      throw new BadRequestException(
        'Konteks chat tidak sesuai dengan program yang dipilih.',
      );
    }

    const [programId] = Array.from(contextProgramIds);
    const program = await this.programRepo.findOne({
      where: { id_program: programId },
    });

    if (!program) {
      throw new BadRequestException('Program chat tidak ditemukan.');
    }

    return program;
  }

  private async ensureChatAccess(context: any, user: any) {
    const program = await this.resolveProgramForChatContext(context);

    if (this.isElevatedChatUser(user)) return program;

    if (this.isVendorChatUser(user)) {
      const vendor = await this.vendorRepo.findOne({
        where: { id_user: Number(user.id_user) },
      });
      const programVendorIds = this.getProgramVendorIds(program);

      if (vendor && programVendorIds.includes(Number(vendor.id_vendor))) {
        return program;
      }
    }

    const userSchoolId = this.toNumberOrNull(user?.id_sekolah);
    const programSchoolIds = this.getProgramSchoolIds(program);

    if (userSchoolId && programSchoolIds.includes(userSchoolId)) {
      return program;
    }

    throw new ForbiddenException(
      'Anda tidak memiliki akses ke chat program ini.',
    );
  }

  private async ensureGoogleDriveConnected(id_user: number) {
    const driveStatus = await this.googleDriveService.getStatus(id_user);

    if (!driveStatus?.connected) {
      throw new BadRequestException({
        code: 'GOOGLE_DRIVE_NOT_CONNECTED',
        message:
          'Akun Anda belum tertaut ke Google Drive. Hubungkan Google Drive terlebih dahulu untuk mengunggah dokumentasi termin.',
      });
    }
  }

  private getDriveFilePath(uploadedFile: any, fallbackName: string) {
    const driveFile = uploadedFile?.file;

    return (
      driveFile?.web_view_link ||
      driveFile?.web_content_link ||
      driveFile?.drive_file_id ||
      fallbackName
    );
  }

  async createTermin(
    createDto: any,
    file: Express.Multer.File,
    id_user: number,
    nama_user: string,
    role_user: string,
    id_role?: number | null,
  ) {
    try {
      if (file) {
        await this.ensureGoogleDriveConnected(id_user);
      }

      const termin = this.terminRepo.create({
        nama_termin: createDto.nama_termin,
        deskripsi: createDto.deskripsi || null,
        jumlah_pembayaran: createDto.jumlah_pembayaran
          ? Number(createDto.jumlah_pembayaran)
          : 0,
        id_kegiatans: createDto.id_kegiatans
          ? Number(createDto.id_kegiatans)
          : null,
        id_fase: createDto.id_fase ? Number(createDto.id_fase) : null,
        status: 'WAITING_UPLOAD',
        file_dokumentasi: null,
        nama_file_dokumentasi: file ? file.originalname : null,
      });

      const savedTermin = await this.terminRepo.save(termin);

      if (file) {
        const uploaded = await this.googleDriveService.uploadFile({
          idUser: id_user,
          idRole: id_role || null,
          file,
          moduleType: 'TERMIN_DOKUMENTASI',
          relatedTable: 't_termin',
          relatedId: savedTermin.id_termin,
        });

        savedTermin.file_dokumentasi = this.getDriveFilePath(
          uploaded,
          file.originalname,
        );
        savedTermin.nama_file_dokumentasi = file.originalname;

        return await this.terminRepo.save(savedTermin);
      }

      return savedTermin;
    } catch (error) {
      this.logger.error('Error saat save termin:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Gagal menyimpan termin!');
    }
  }

  async getTerminsByKegiatans(id_kegiatans: number) {
    return await this.terminRepo.find({
      where: { id_kegiatans },
      order: { created_at: 'ASC' },
      relations: ['chats', 'persyaratan'],
    });
  }

  async createChat(
    createDto: any,
    id_user: number,
    nama_user: string,
    role_user: string,
    userContext: any = {},
  ) {
    try {
      if (!createDto.pesan || !String(createDto.pesan).trim()) {
        throw new BadRequestException('Pesan tidak boleh kosong');
      }

      const id_program = this.toNumberOrNull(createDto.id_program);
      const id_fase = this.toNumberOrNull(createDto.id_fase);
      const id_termin = this.toNumberOrNull(createDto.id_termin);
      const id_kegiatans = this.toNumberOrNull(createDto.id_kegiatans);
      const id_persyaratan = this.toNumberOrNull(createDto.id_persyaratan);

      const konteks =
        createDto.konteks ||
        (id_persyaratan
          ? 'PERSYARATAN'
          : id_termin
            ? 'TERMIN'
            : id_kegiatans
              ? 'KEGIATAN'
              : id_fase
                ? 'FASE'
                : 'PROGRAM');

      if (!id_program && !id_termin && !id_kegiatans && !id_persyaratan) {
        throw new BadRequestException(
          'Konteks chat tidak valid. Kirim id_program atau id_termin/id_kegiatans/id_persyaratan.',
        );
      }

      await this.ensureChatAccess(createDto, {
        ...userContext,
        id_user,
        role_user,
      });

      const chat = this.chatRepo.create({
        pesan: String(createDto.pesan).trim(),
        id_user,
        nama_user,
        role_user,
        id_program,
        id_fase,
        id_termin,
        id_kegiatans,
        id_persyaratan,
        konteks,
      });

      return await this.chatRepo.save(chat);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error('Error saat save chat:', error);
      throw new InternalServerErrorException('Gagal mengirim pesan!');
    }
  }

  async getChatsByTermin(id_termin: number, userContext: any) {
    await this.ensureChatAccess({ id_termin }, userContext);

    return await this.chatRepo.find({
      where: { id_termin },
      order: { created_at: 'ASC' },
    });
  }

  async getChatsByContext(query: any, userContext: any) {
    const id_program = this.toNumberOrNull(query.id_program);
    const id_fase = this.toNumberOrNull(query.id_fase);
    const id_termin = this.toNumberOrNull(query.id_termin);
    const id_kegiatans = this.toNumberOrNull(query.id_kegiatans);
    const id_persyaratan = this.toNumberOrNull(query.id_persyaratan);

    const builder = this.chatRepo
      .createQueryBuilder('chat')
      .orderBy('chat.created_at', 'ASC');

    if (id_program) {
      builder.andWhere('chat.id_program = :id_program', { id_program });
    }

    if (id_fase) {
      builder.andWhere('chat.id_fase = :id_fase', { id_fase });
    }

    if (id_termin) {
      builder.andWhere('chat.id_termin = :id_termin', { id_termin });
    }

    if (id_kegiatans) {
      builder.andWhere('chat.id_kegiatans = :id_kegiatans', { id_kegiatans });
    }

    if (id_persyaratan) {
      builder.andWhere('chat.id_persyaratan = :id_persyaratan', {
        id_persyaratan,
      });
    }

    if (!id_program && !id_termin && !id_kegiatans && !id_persyaratan) {
      throw new BadRequestException(
        'Konteks chat tidak valid. Minimal kirim id_program atau id_termin/id_kegiatans/id_persyaratan.',
      );
    }

    await this.ensureChatAccess(query, userContext);

    return await builder.getMany();
  }
}
