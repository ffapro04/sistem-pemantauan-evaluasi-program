/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { Program } from './entities/program.entity';
import { Fase } from './entities/fase.entity';
import { Kegiatans } from './entities/kegiatans.entity';
import { Termin } from './entities/termin.entity';
import { PersyaratanTermin } from './entities/persyaratan-termin.entity';
import { PersyaratanKegiatan } from './entities/persyaratan-kegiatan.entity';
import { DokumenProgram } from './entities/dokumen-program.entity';
import { KegiatanComment } from './entities/kegiatan-comment.entity';
import { KegiatanPertemuan } from './entities/kegiatan-pertemuan.entity';
import { KegiatanRating } from './entities/kegiatan-rating.entity';
import { PersyaratanStatus } from './entities/persyaratan-termin.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { NotificationRecipientType } from '../notifikasi/entities/notifikasi.entity';
import { parsePagination, toPaginatedResult } from '../common/pagination.util';

@Injectable()
export class ProgramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProgramService.name);
  private reminderTimer: NodeJS.Timeout | null = null;
  private lastReminderRunDate: string | null = null;

  private readonly PROGRAM_FASES_RELATIONS = [
    'fases',
    'fases.termin',
    'fases.termin.persyaratan',
    'fases.termin.chats',
    'fases.kegiatans',
    'fases.kegiatans.pertemuan',
    'fases.kegiatans.persyaratan',
    'fases.kegiatans.comments',
    'fases.kegiatans.ratings',
    'fases.kegiatans.termin',
    'fases.kegiatans.termin.chats',
  ];

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

    @InjectRepository(KegiatanComment)
    private readonly kegiatanCommentRepo: Repository<KegiatanComment>,

    @InjectRepository(KegiatanPertemuan)
    private readonly kegiatanPertemuanRepo: Repository<KegiatanPertemuan>,

    @InjectRepository(KegiatanRating)
    private readonly kegiatanRatingRepo: Repository<KegiatanRating>,
    private readonly googleDriveService: GoogleDriveService,
    private readonly notifikasiService: NotifikasiService,
  ) {}

  onModuleInit() {
    this.reminderTimer = setInterval(
      () => {
        const now = new Date();
        const today = now.toISOString().slice(0, 10);

        if (now.getHours() !== 7 || this.lastReminderRunDate === today) return;

        this.lastReminderRunDate = today;
        this.createDeadlineReminders().catch((error) => {
          this.logger.error('PROGRAM_DEADLINE_REMINDER_ERROR:', error);
        });
      },
      60 * 60 * 1000,
    );
  }

  onModuleDestroy() {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
      this.reminderTimer = null;
    }
  }

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

  private normalizeProgramCategory(value: any): string {
    const normalized = String(value || '')
      .trim()
      .toUpperCase()
      .replace(/[-\s]+/g, '_');

    if (normalized === 'NONAKADEMIK') return 'NON_AKADEMIK';

    return normalized;
  }

  private normalizeProgramPilar(value: any): string | null {
    const normalized = String(value || '')
      .trim()
      .toUpperCase()
      .replace(/[-\s]+/g, '_');

    if (!normalized) return null;
    if (normalized === 'SENIBUDAYA') return 'SENI_BUDAYA';
    if (normalized === 'KECAKAPANHIDUP') return 'KECAKAPAN_HIDUP';

    return normalized;
  }

  private validateProgramPilar(kategori: any, pilarProgram: any): void {
    if (!pilarProgram) return;

    const normalizedKategori = this.normalizeProgramCategory(kategori);
    const normalizedPilar = this.normalizeProgramPilar(pilarProgram);

    const allowedPillars: Record<string, string[]> = {
      AKADEMIK: ['AKADEMIK', 'KARAKTER'],
      NON_AKADEMIK: ['SENI_BUDAYA', 'KECAKAPAN_HIDUP'],
    };

    const allowed = allowedPillars[normalizedKategori];

    if (!allowed) {
      throw new BadRequestException(
        `Kategori program tidak valid: ${normalizedKategori || '-'}`,
      );
    }

    if (!normalizedPilar || !allowed.includes(normalizedPilar)) {
      throw new BadRequestException(
        `Pilar ${normalizedPilar || '-'} tidak sesuai dengan kategori ${normalizedKategori}`,
      );
    }
  }

  private normalizeAccessText(value: any): string {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');
  }

  private normalizeSchoolJenjang(value: any): string {
    const text = String(value || '')
      .trim()
      .toUpperCase();

    if (/\bSMK\b/.test(text) || text === 'SMK') return 'SMK';
    if (/\bSMP\b/.test(text) || text === 'SMP') return 'SMP';
    if (/\bSD\b/.test(text) || text === 'SD') return 'SD';

    return '';
  }

  private uniquePositiveNumbers(values: any[]): number[] {
    return Array.from(
      new Set(
        values
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value > 0),
      ),
    );
  }

  private async getAllowedJenjangForHo(
    id_user: number,
    id_role?: number | null,
  ): Promise<string[] | null> {
    const rows = await this.programRepo.manager.query(
      `
        SELECT
          id_user,
          id_role,
          jabatan,
          jenis,
          sub_jenis
        FROM m_users
        WHERE id_user = $1
        LIMIT 1
      `,
      [id_user],
    );

    const user = rows?.[0] || {};
    const resolvedRoleId = Number(user?.id_role || id_role || 0);
    const jabatan = this.normalizeAccessText(user?.jabatan);
    const jenis = this.normalizeAccessText(user?.jenis);
    const subJenis = this.normalizeAccessText(user?.sub_jenis);

    const isHo =
      resolvedRoleId === 3 ||
      jabatan.includes('head office') ||
      jabatan.includes('ho');

    if (!isHo) return null;

    if (jenis.includes('non')) {
      return ['SD', 'SMP', 'SMK'];
    }

    if (jenis.includes('akademik') && !jenis.includes('non')) {
      if (subJenis.includes('smk')) return ['SMK'];

      if (subJenis.includes('sd') && subJenis.includes('smp')) {
        return ['SD', 'SMP'];
      }

      if (subJenis.includes('sd')) return ['SD'];
      if (subJenis.includes('smp')) return ['SMP'];

      throw new BadRequestException(
        'Profil HO Akademik belum memiliki sub_jenis yang valid. Isi sub_jenis dengan SD & SMP atau SMK.',
      );
    }

    throw new BadRequestException(
      'Profil Head Office belum memiliki jenis yang valid.',
    );
  }

  private async validateHoSchoolAccess(
    id_user: number,
    id_role: number | null | undefined,
    selectedSchoolIds: any[],
  ): Promise<void> {
    const schoolIds = this.uniquePositiveNumbers(selectedSchoolIds || []);

    if (schoolIds.length === 0) {
      throw new BadRequestException('Minimal pilih satu sekolah sasaran.');
    }

    const allowedJenjang = await this.getAllowedJenjangForHo(id_user, id_role);

    if (!allowedJenjang) return;

    const schools = await this.programRepo.manager.query(
      `
        SELECT
          id_sekolah,
          nama_sekolah,
          jenjang
        FROM m_sekolah
        WHERE id_sekolah = ANY($1::int[])
      `,
      [schoolIds],
    );

    if (schools.length !== schoolIds.length) {
      const foundIds = schools.map((item: any) => Number(item.id_sekolah));
      const missingIds = schoolIds.filter((id) => !foundIds.includes(id));

      throw new BadRequestException(
        `Sekolah sasaran tidak ditemukan: ${missingIds.join(', ')}`,
      );
    }

    const invalidSchools = schools.filter((school: any) => {
      const jenjang = this.normalizeSchoolJenjang(school?.jenjang);
      return !allowedJenjang.includes(jenjang);
    });

    if (invalidSchools.length > 0) {
      const invalidNames = invalidSchools
        .map(
          (school: any) =>
            `${school.nama_sekolah || `ID ${school.id_sekolah}`} (${school.jenjang || '-'})`,
        )
        .join(', ');

      throw new BadRequestException(
        `Sekolah sasaran tidak sesuai akses HO. HO ini hanya boleh memilih jenjang ${allowedJenjang.join('/')}. Sekolah tidak valid: ${invalidNames}`,
      );
    }
  }

  private normalizeRole(role: any) {
    return String(role || '')
      .trim()
      .toLowerCase();
  }

  private isVendorRole(role: any) {
    const value = this.normalizeRole(role);
    return (
      value === '6' ||
      value === 'vendor' ||
      value.includes('vendor') ||
      value.includes('narasumber')
    );
  }

  private isAORole(role: any) {
    const value = this.normalizeRole(role);
    return (
      value === '4' ||
      value === 'ao' ||
      value === 'area officer' ||
      value.includes('area officer')
    );
  }

  private async resolveRatingActor(id_user: number, body: any = {}) {
    const userId = Number(id_user || 0);

    if (!userId) {
      throw new BadRequestException('Identitas pemberi rating tidak valid.');
    }

    const userRows = await this.programRepo.manager.query(
      `SELECT id_role, id_sekolah FROM m_users WHERE id_user = $1 LIMIT 1`,
      [userId],
    );
    const userRow = userRows?.[0] || null;
    const roleId = Number(userRow?.id_role || 0);

    const vendorRows = await this.programRepo.manager.query(
      `SELECT id_vendor FROM m_vendor WHERE id_user = $1 LIMIT 1`,
      [userId],
    );
    const vendorId = vendorRows?.[0]?.id_vendor
      ? Number(vendorRows[0].id_vendor)
      : null;

    if (roleId === 6 || (!userRow && vendorId)) {
      if (!vendorId) {
        throw new BadRequestException(
          'Akun Vendor tidak terhubung dengan data Vendor.',
        );
      }

      return {
        raterType: 'VENDOR' as const,
        idVendor: vendorId,
        idGuruAssessment: null,
        idSekolah: null,
      };
    }

    if (userRow && roleId !== 8) {
      throw new BadRequestException(
        'Rating hanya dapat diberikan oleh Guru Assessment atau Vendor.',
      );
    }

    const guruId = Number(body?.id_guru_assessment || userId || 0);

    if (!guruId) {
      throw new BadRequestException(
        'Akun Guru Assessment tidak terhubung dengan data guru.',
      );
    }

    // Untuk token khusus Guru Assessment, sub/id_user harus sama dengan
    // id_guru_assessment agar akun lain tidak dapat menyamar sebagai guru.
    if (!userRow && guruId !== userId) {
      throw new BadRequestException(
        'Identitas Guru Assessment tidak sesuai dengan akun yang login.',
      );
    }

    const guruRows = await this.programRepo.manager.query(
      `
        SELECT id_guru_assessment, id_sekolah
        FROM assessment_guru
        WHERE id_guru_assessment = $1
          AND is_active = true
        LIMIT 1
      `,
      [guruId],
    );
    const guru = guruRows?.[0] || null;

    if (!guru) {
      throw new BadRequestException(
        'Akun Guru Assessment tidak aktif atau tidak ditemukan.',
      );
    }

    return {
      raterType: 'GURU' as const,
      idVendor: null,
      idGuruAssessment: Number(guru.id_guru_assessment),
      idSekolah: guru.id_sekolah ? Number(guru.id_sekolah) : null,
    };
  }

  private isHORole(role: any) {
    const value = this.normalizeRole(role);
    return (
      value === '3' ||
      value === 'ho' ||
      value === 'head office' ||
      value.includes('head office')
    );
  }

  private async ensureGoogleDriveConnected(id_user: number, message: string) {
    const driveStatus = await this.googleDriveService.getStatus(id_user);

    if (!driveStatus?.connected) {
      throw new BadRequestException({
        code: 'GOOGLE_DRIVE_NOT_CONNECTED',
        message,
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

  private async hydrateProgramPersonas<T extends any>(payload: T | T[]) {
    const isArrayPayload = Array.isArray(payload);
    const programs = (isArrayPayload ? payload : [payload]).filter(
      Boolean,
    ) as any[];

    if (programs.length === 0) return payload;

    const uniqueNumbers = (values: any[]) =>
      Array.from(
        new Set(
          values
            .flatMap((value) => this.toArray(value))
            .map(Number)
            .filter((value) => Number.isFinite(value) && value > 0),
        ),
      );

    const hoIds = uniqueNumbers(
      programs.flatMap((program) => [
        program?.id_ho,
        program?.ho_id,
        program?.dibuat_oleh,
        program?.created_by,
        program?.created_by_user_id,
      ]),
    );

    const aoIds = uniqueNumbers(
      programs.flatMap((program) => [
        program?.id_pengawas,
        program?.id_ao,
        program?.ao_id,
        program?.ao_ids,
      ]),
    );

    const vendorIds = uniqueNumbers(
      programs.flatMap((program) => [
        program?.id_vendor,
        program?.vendor_id,
        program?.vendor_ids,
      ]),
    );

    const sekolahIds = uniqueNumbers(
      programs.flatMap((program) => [
        program?.id_sekolah,
        program?.sekolah_id,
        program?.sekolah_ids,
        program?.target_sekolah_ids,
      ]),
    );

    const programIds = uniqueNumbers(
      programs.flatMap((program) => [program?.id_program, program?.id]),
    );

    const [hoRows, aoRows, vendorRows, sekolahRows, ratingRows] =
      await Promise.all([
        hoIds.length
          ? this.programRepo.manager.query(
              `
                SELECT
                  id_user,
                  nama,
                  email,
                  jabatan,
                  id_role
                FROM m_users
                WHERE id_user = ANY($1::int[])
              `,
              [hoIds],
            )
          : Promise.resolve([]),

        aoIds.length
          ? this.programRepo.manager.query(
              `
                SELECT
                  id_user,
                  nama,
                  email,
                  jabatan,
                  id_role
                FROM m_users
                WHERE id_user = ANY($1::int[])
              `,
              [aoIds],
            )
          : Promise.resolve([]),

        vendorIds.length
          ? this.programRepo.manager.query(
              `
                SELECT
                  id_vendor,
                  nama_vendor,
                  no_register,
                  pilar,
                  id_user
                FROM m_vendor
                WHERE id_vendor = ANY($1::int[])
              `,
              [vendorIds],
            )
          : Promise.resolve([]),

        sekolahIds.length
          ? this.programRepo.manager.query(
              `
                SELECT
                  id_sekolah,
                  nama_sekolah,
                  npsn,
                  jenjang,
                  id_wilayah
                FROM m_sekolah
                WHERE id_sekolah = ANY($1::int[])
              `,
              [sekolahIds],
            )
          : Promise.resolve([]),

        programIds.length
          ? this.programRepo.manager.query(
              `
                SELECT
                  f.id_program,
                  AVG(kr.rating)::numeric AS average_rating,
                  COUNT(*)::int AS total_rating,
                  COUNT(DISTINCT kr.id_guru_assessment)::int AS guru_count
                FROM t_kegiatan_rating kr
                JOIN t_kegiatans k ON k.id_kegiatans = kr.id_kegiatans
                JOIN t_fase f ON f.id_fase = k.id_fase
                WHERE f.id_program = ANY($1::int[])
                  AND UPPER(COALESCE(kr.rater_type, '')) = 'GURU'
                GROUP BY f.id_program
              `,
              [programIds],
            )
          : Promise.resolve([]),
      ]);

    const hoMap = new Map(hoRows.map((row: any) => [Number(row.id_user), row]));
    const aoMap = new Map(aoRows.map((row: any) => [Number(row.id_user), row]));
    const vendorMap = new Map(
      vendorRows.map((row: any) => [Number(row.id_vendor), row]),
    );
    const sekolahMap = new Map(
      sekolahRows.map((row: any) => [Number(row.id_sekolah), row]),
    );
    const ratingMap = new Map<
      number,
      {
        average_rating: number;
        total_rating: number;
        guru_rating_count: number;
        source: string;
      }
    >(
      ratingRows.map((row: any) => {
        const averageRating = Number(row.average_rating || 0);
        const totalRating = Number(row.total_rating || 0);
        const guruCount = Number(row.guru_count || 0);

        return [
          Number(row.id_program),
          {
            average_rating: Number(averageRating.toFixed(2)),
            total_rating: totalRating,
            guru_rating_count: guruCount || totalRating,
            source: 'GURU',
          },
        ];
      }),
    );

    programs.forEach((program) => {
      const programId = Number(program?.id_program ?? program?.id ?? 0);
      const programHoIds = uniqueNumbers([
        program?.id_ho,
        program?.ho_id,
        program?.dibuat_oleh,
        program?.created_by,
        program?.created_by_user_id,
      ]);

      const programAoIds = uniqueNumbers([
        program?.id_pengawas,
        program?.id_ao,
        program?.ao_id,
        program?.ao_ids,
      ]);

      const programVendorIds = uniqueNumbers([
        program?.id_vendor,
        program?.vendor_id,
        program?.vendor_ids,
      ]);

      const programSekolahIds = uniqueNumbers([
        program?.id_sekolah,
        program?.sekolah_id,
        program?.sekolah_ids,
        program?.target_sekolah_ids,
      ]);

      const ho = programHoIds.map((id) => hoMap.get(id)).find(Boolean) || null;
      const aos = programAoIds.map((id) => aoMap.get(id)).filter(Boolean);
      const vendors = programVendorIds
        .map((id) => vendorMap.get(id))
        .filter(Boolean);
      const sekolahs = programSekolahIds
        .map((id) => sekolahMap.get(id))
        .filter(Boolean);

      program.ho = ho;
      program.head_office = ho;
      program.created_by_user = ho;
      program.creator = ho;

      program.aos = aos;
      program.ao_users = aos;
      program.pengawas = program.pengawas || aos[0] || null;
      program.ao = program.ao || aos[0] || null;

      program.vendors = vendors;
      program.vendorList = vendors;
      program.vendor = program.vendor || vendors[0] || null;

      program.sekolahs = sekolahs;
      program.schools = sekolahs;
      program.sekolahList = sekolahs;
      program.sekolah = program.sekolah || sekolahs[0] || null;
      program.target_sekolahs = sekolahs;

      const guruRating = ratingMap.get(programId) || {
        average_rating: 0,
        total_rating: 0,
        guru_rating_count: 0,
        source: 'GURU',
      };

      program.guru_average_rating = guruRating.average_rating;
      program.average_guru_rating = guruRating.average_rating;
      program.rating_guru_average = guruRating.average_rating;
      program.guru_rating_count = guruRating.guru_rating_count;
      program.rating_guru_count = guruRating.guru_rating_count;
      program.guru_rating_submission_count = guruRating.total_rating;
      program.program_guru_rating = guruRating;
      program.guru_rating_summary = guruRating;
    });

    return isArrayPayload ? programs : programs[0];
  }

  private async getProgramNotificationAudience(
    program: Program | any,
    preloadedHoRows?: any[],
  ) {
    const hoUserIds = new Set<number>();
    const aoUserIds = new Set<number>();
    const vendorUserIds = new Set<number>();
    const schoolUserIds = new Set<number>();
    const guruIds = new Set<number>();

    const sekolahIds = this.toArray(program?.sekolah_ids).length
      ? this.toArray(program.sekolah_ids)
      : program?.id_sekolah
        ? [Number(program.id_sekolah)]
        : [];

    const aoIds = this.toArray(program?.ao_ids).length
      ? this.toArray(program.ao_ids)
      : program?.id_pengawas
        ? [Number(program.id_pengawas)]
        : [];

    const vendorIds = this.toArray(program?.vendor_ids).length
      ? this.toArray(program.vendor_ids)
      : this.toArray(program?.id_vendor);

    if (program?.dibuat_oleh) hoUserIds.add(Number(program.dibuat_oleh));
    aoIds.forEach((id) => id && aoUserIds.add(Number(id)));

    let schoolJenjangs: string[] = [];

    if (sekolahIds.length > 0) {
      const schoolRows = await this.programRepo.manager.query(
        `
          SELECT jenjang
          FROM m_sekolah
          WHERE id_sekolah = ANY($1::int[])
        `,
        [sekolahIds],
      );

      schoolJenjangs = Array.from(
        new Set(
          schoolRows
            .map((row: any) => String(row.jenjang || '').toUpperCase())
            .filter(Boolean),
        ),
      );
    }

    const hoRows =
      preloadedHoRows ||
      (await this.programRepo.manager.query(
        `
          SELECT id_user, jenis, sub_jenis, jabatan
          FROM m_users
          WHERE id_role = 3
            AND status = true
        `,
      ));

    const programCategory = this.normalizeProgramCategory(program?.kategori);
    const programPilar = String(program?.pilar_program || '')
      .trim()
      .toUpperCase();
    const isNonAkademik =
      programCategory === 'NON_AKADEMIK' ||
      ['SENI_BUDAYA', 'KECAKAPAN_HIDUP'].includes(programPilar);
    const hasSmk = schoolJenjangs.includes('SMK');
    const hasSdSmp =
      schoolJenjangs.includes('SD') || schoolJenjangs.includes('SMP');

    hoRows.forEach((row: any) => {
      const idUser = Number(row.id_user || 0);
      if (!idUser) return;

      const jenis = String(row.jenis || row.jabatan || '').toLowerCase();
      const subJenis = String(row.sub_jenis || '').toUpperCase();

      if (isNonAkademik) {
        if (
          jenis.includes('non') ||
          jenis.includes('seni') ||
          jenis.includes('kecakapan')
        ) {
          hoUserIds.add(idUser);
        }
        return;
      }

      if (!jenis.includes('akademik') || jenis.includes('non')) return;

      if (
        !schoolJenjangs.length ||
        subJenis.includes('SEMUA') ||
        (hasSmk && subJenis.includes('SMK')) ||
        (hasSdSmp && (subJenis.includes('SD') || subJenis.includes('SMP')))
      ) {
        hoUserIds.add(idUser);
      }
    });

    if (vendorIds.length > 0) {
      const vendors = await this.programRepo.manager.query(
        `
          SELECT id_user
          FROM m_vendor
          WHERE id_vendor = ANY($1::int[])
            AND id_user IS NOT NULL
        `,
        [vendorIds],
      );

      vendors.forEach((row: any) => {
        if (row.id_user) vendorUserIds.add(Number(row.id_user));
      });
    }

    if (sekolahIds.length > 0) {
      const schoolUsers = await this.programRepo.manager.query(
        `
          SELECT id_user
          FROM m_users
          WHERE id_sekolah = ANY($1::int[])
            AND status = true
            AND (id_role IN (5, 9) OR LOWER(COALESCE(jabatan, '')) LIKE '%kepala%')
        `,
        [sekolahIds],
      );

      schoolUsers.forEach((row: any) => {
        if (row.id_user) schoolUserIds.add(Number(row.id_user));
      });

      const gurus = await this.programRepo.manager.query(
        `
          SELECT id_guru_assessment
          FROM assessment_guru
          WHERE id_sekolah = ANY($1::int[])
            AND is_active = true
        `,
        [sekolahIds],
      );

      gurus.forEach((row: any) => {
        if (row.id_guru_assessment) {
          guruIds.add(Number(row.id_guru_assessment));
        }
      });
    }

    return {
      hoUserIds: Array.from(hoUserIds).filter(Boolean),
      aoUserIds: Array.from(aoUserIds).filter(Boolean),
      vendorUserIds: Array.from(vendorUserIds).filter(Boolean),
      schoolUserIds: Array.from(schoolUserIds).filter(Boolean),
      guruIds: Array.from(guruIds).filter(Boolean),
    };
  }

  private async getProgramNotificationTargets(program: Program | any) {
    const audience = await this.getProgramNotificationAudience(program);

    return {
      userIds: Array.from(
        new Set([
          ...audience.hoUserIds,
          ...audience.aoUserIds,
          ...audience.vendorUserIds,
          ...audience.schoolUserIds,
        ]),
      ).filter(Boolean),
      guruIds: audience.guruIds,
    };
  }

  private getHoProgramTargetUrl(program: Program | any) {
    const kategori = this.normalizeProgramCategory(program?.kategori);
    const base =
      kategori === 'NON_AKADEMIK'
        ? '/ho/program/non-akademik'
        : '/ho/program/akademik';

    return `${base}/detail/${program.id_program}`;
  }

  private async getProgramByTermin(id_termin: number) {
    const rows = await this.programRepo.manager.query(
      `
        SELECT
          p.*,
          f.id_fase,
          f.nama_fase,
          t.nama_termin
        FROM t_program p
        JOIN t_fase f ON f.id_program = p.id_program
        JOIN t_termin t ON t.id_fase = f.id_fase
        WHERE t.id_termin = $1
        LIMIT 1
      `,
      [id_termin],
    );

    return rows?.[0] || null;
  }

  private async notifyProgramEvidenceWorkflow(
    program: Program | any,
    options: {
      audience:
        | 'UPLOAD'
        | 'AO_APPROVED'
        | 'AO_REJECTED'
        | 'HO_APPROVED'
        | 'HO_REJECTED';
      idPersyaratan: number;
      evidenceType: 'ADMINISTRASI' | 'KEGIATAN';
      requirementName?: string;
      contextName?: string;
      actorUserId?: number | null;
      reason?: string | null;
      idTermin?: number | null;
      idKegiatans?: number | null;
    },
  ) {
    if (!program?.id_program) return;

    const audience = await this.getProgramNotificationAudience(program);
    const rows: any[] = [];
    const pushed = new Set<string>();
    const programName = program.nama_program || 'Program';
    const requirementName = options.requirementName || 'Bukti program';
    const contextName = options.contextName ? ` (${options.contextName})` : '';
    const reasonText = options.reason ? ` Alasan: ${options.reason}` : '';
    const targetUrls = {
      ho: this.getHoProgramTargetUrl(program),
      ao: `/ao/program/detail/${program.id_program}`,
      vendor: `/vendor/program/detail/${program.id_program}`,
    };

    const payloadMap = {
      UPLOAD: {
        judul: 'Bukti program baru diupload',
        pesan: `Vendor mengupload "${requirementName}"${contextName} pada program "${programName}". Menunggu review AO dan HO.`,
        tipe: 'PROGRAM_EVIDENCE_UPLOADED',
      },
      AO_APPROVED: {
        judul: 'Bukti diteruskan AO ke HO',
        pesan: `AO menyetujui "${requirementName}"${contextName} pada program "${programName}". Menunggu validasi HO.`,
        tipe: 'PROGRAM_EVIDENCE_AO_APPROVED',
      },
      AO_REJECTED: {
        judul: 'Bukti ditolak AO',
        pesan: `AO menolak "${requirementName}"${contextName} pada program "${programName}".${reasonText}`,
        tipe: 'PROGRAM_EVIDENCE_AO_REJECTED',
      },
      HO_APPROVED: {
        judul: 'Bukti di-ACC HO',
        pesan: `HO menyetujui "${requirementName}"${contextName} pada program "${programName}".`,
        tipe: 'PROGRAM_EVIDENCE_HO_APPROVED',
      },
      HO_REJECTED: {
        judul: 'Bukti ditolak HO',
        pesan: `HO menolak "${requirementName}"${contextName} pada program "${programName}". Vendor perlu upload ulang.${reasonText}`,
        tipe: 'PROGRAM_EVIDENCE_HO_REJECTED',
      },
    };

    const pushUserRows = (
      ids: number[],
      scope: 'ho' | 'ao' | 'vendor',
      payload: any,
    ) => {
      ids.forEach((idUser) => {
        const id = Number(idUser);
        if (!id || id === Number(options.actorUserId || 0)) return;

        const pushKey = `${scope}:${id}`;
        if (pushed.has(pushKey)) return;
        pushed.add(pushKey);

        rows.push({
          recipientType: NotificationRecipientType.USER,
          recipientId: id,
          legacyUserId: id,
          judul: payload.judul,
          pesan: payload.pesan,
          tipe: payload.tipe,
          targetUrl: targetUrls[scope],
          metadata: {
            id_program: program.id_program,
            id_persyaratan: options.idPersyaratan,
            evidence_type: options.evidenceType,
            workflow_action: options.audience,
            id_termin: options.idTermin || null,
            id_kegiatans: options.idKegiatans || null,
            reason: options.reason || null,
          },
        });
      });
    };

    const payload = payloadMap[options.audience];

    if (options.audience === 'UPLOAD') {
      pushUserRows(audience.aoUserIds, 'ao', payload);
      pushUserRows(audience.hoUserIds, 'ho', payload);
    }

    if (options.audience === 'AO_APPROVED') {
      pushUserRows(audience.hoUserIds, 'ho', payload);
      pushUserRows(audience.vendorUserIds, 'vendor', payload);
    }

    if (options.audience === 'AO_REJECTED') {
      pushUserRows(audience.hoUserIds, 'ho', payload);
      pushUserRows(audience.vendorUserIds, 'vendor', payload);
    }

    if (
      options.audience === 'HO_APPROVED' ||
      options.audience === 'HO_REJECTED'
    ) {
      pushUserRows(audience.aoUserIds, 'ao', payload);
      pushUserRows(audience.vendorUserIds, 'vendor', payload);
    }

    await this.notifikasiService.dispatchMany(rows);
  }

  private async notifyProgramCreated(
    program: Program | any,
    actorUserId?: number | null,
  ) {
    if (!program?.id_program) return;

    const audience = await this.getProgramNotificationAudience(program);
    const rows: any[] = [];
    const pushed = new Set<string>();
    const programName = program.nama_program || 'Program';
    const targetUrls = {
      ho: this.getHoProgramTargetUrl(program),
      ao: `/ao/program/detail/${program.id_program}`,
      vendor: `/vendor/program/detail/${program.id_program}`,
      school: '/sekolah/program',
    };

    const pushUserRows = (
      ids: number[],
      scope: 'ho' | 'ao' | 'vendor' | 'school',
      payload: { judul: string; pesan: string; tipe: string },
    ) => {
      ids.forEach((idUser) => {
        const id = Number(idUser || 0);
        if (!id || id === Number(actorUserId || 0)) return;

        const key = `${scope}:${id}`;
        if (pushed.has(key)) return;
        pushed.add(key);

        rows.push({
          recipientType: NotificationRecipientType.USER,
          recipientId: id,
          legacyUserId: id,
          judul: payload.judul,
          pesan: payload.pesan,
          tipe: payload.tipe,
          targetUrl: targetUrls[scope],
          metadata: {
            id_program: program.id_program,
            notification_scope: scope,
          },
          dedupeKey: `program-created:${scope}:${program.id_program}:${id}`,
        });
      });
    };

    pushUserRows(audience.hoUserIds, 'ho', {
      judul: 'Program baru dibuat',
      pesan: `Program "${programName}" sudah dibuat dan siap dipantau pada dashboard Head Office.`,
      tipe: 'PROGRAM_CREATED',
    });

    pushUserRows(audience.aoUserIds, 'ao', {
      judul: 'Program baru perlu dipantau',
      pesan: `Program "${programName}" sudah ditetapkan. Pantau progres lapangan dan review bukti dari vendor sesuai alur.`,
      tipe: 'PROGRAM_CREATED',
    });

    pushUserRows(audience.vendorUserIds, 'vendor', {
      judul: 'Program baru ditugaskan',
      pesan: `Program "${programName}" sudah ditugaskan kepada Anda. Buka detail program untuk melihat periode, aktivitas, dan upload bukti.`,
      tipe: 'PROGRAM_CREATED',
    });

    pushUserRows(audience.schoolUserIds, 'school', {
      judul: 'Program baru untuk sekolah',
      pesan: `Program "${programName}" sudah masuk untuk sekolah Anda. Pantau progres dan beri rating jika aktivitas telah selesai.`,
      tipe: 'PROGRAM_CREATED',
    });

    audience.guruIds.forEach((idGuru) => {
      const id = Number(idGuru || 0);
      if (!id) return;

      rows.push({
        recipientType: NotificationRecipientType.GURU_ASSESSMENT,
        recipientId: id,
        judul: 'Program baru untuk sekolah',
        pesan: `Program "${programName}" sudah tersedia untuk sekolah Anda. Buka sistem untuk melihat program dan memberi rating saat aktivitas selesai.`,
        tipe: 'PROGRAM_CREATED',
        targetUrl: targetUrls.school,
        metadata: {
          id_program: program.id_program,
          notification_scope: 'guru',
        },
        dedupeKey: `program-created:guru:${program.id_program}:${id}`,
      });
    });

    await this.notifikasiService.dispatchMany(rows);
  }

  private async getProgramByKegiatan(id_kegiatans: number) {
    const rows = await this.programRepo.manager.query(
      `
        SELECT
          p.*,
          f.id_fase,
          f.nama_fase,
          k.nama_kegiatans
        FROM t_program p
        JOIN t_fase f ON f.id_program = p.id_program
        JOIN t_kegiatans k ON k.id_fase = f.id_fase
        WHERE k.id_kegiatans = $1
        LIMIT 1
      `,
      [id_kegiatans],
    );

    return rows?.[0] || null;
  }

  private isAfterProgramDeadline(program: Program | any) {
    if (!program?.tanggal_selesai) return false;

    const deadline = new Date(program.tanggal_selesai);
    if (Number.isNaN(deadline.getTime())) return false;

    deadline.setHours(23, 59, 59, 999);

    return new Date() > deadline;
  }

  private async ensureProgramFeedbackOpenByKegiatan(id_kegiatans: number) {
    const program = await this.getProgramByKegiatan(id_kegiatans);

    if (this.isAfterProgramDeadline(program)) {
      throw new BadRequestException(
        'Periode program sudah berakhir. Komentar dan rating sudah ditutup.',
      );
    }

    return program;
  }

  private async notifyActivityRatingRequest(kegiatan: Kegiatans) {
    const program = await this.getProgramByKegiatan(kegiatan.id_kegiatans);
    if (!program) return;

    const audience = await this.getProgramNotificationAudience(program);
    const targetUrlSekolah = '/sekolah/program';
    const targetUrlVendor = `/vendor/program/detail/${program.id_program}`;

    const rows = [
      ...audience.guruIds.map((idGuru) => ({
        recipientType: NotificationRecipientType.GURU_ASSESSMENT,
        recipientId: idGuru,
        judul: 'Rating aktivitas program',
        pesan: `Aktivitas "${kegiatan.nama_kegiatans}" sudah selesai. Silakan beri rating dan feedback.`,
        tipe: 'PROGRAM_RATING',
        targetUrl: targetUrlSekolah,
        metadata: {
          id_program: program.id_program,
          id_kegiatans: kegiatan.id_kegiatans,
        },
        dedupeKey: `program-rating:guru:${kegiatan.id_kegiatans}:${idGuru}`,
      })),
      ...audience.vendorUserIds.map((idUser) => ({
        recipientType: NotificationRecipientType.USER,
        recipientId: idUser,
        legacyUserId: idUser,
        judul: 'Rating aktivitas program',
        pesan: `Aktivitas "${kegiatan.nama_kegiatans}" pada program "${program.nama_program}" sudah selesai. Silakan beri rating dan feedback.`,
        tipe: 'PROGRAM_RATING',
        targetUrl: targetUrlVendor,
        metadata: {
          id_program: program.id_program,
          id_kegiatans: kegiatan.id_kegiatans,
        },
        dedupeKey: `program-rating:vendor:${kegiatan.id_kegiatans}:${idUser}`,
      })),
    ];

    await this.notifikasiService.dispatchMany(rows);
  }

  private getTomorrowDateString() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }

  async createDeadlineReminders(date = this.getTomorrowDateString()) {
    const activityRows = await this.programRepo.manager.query(
      `
        SELECT
          p.*,
          k.id_kegiatans,
          k.nama_kegiatans,
          k.tanggal_selesai
        FROM t_program p
        JOIN t_fase f ON f.id_program = p.id_program
        JOIN t_kegiatans k ON k.id_fase = f.id_fase
        WHERE k.tanggal_selesai = $1::date
          AND EXISTS (
            SELECT 1
            FROM t_persyaratan_kegiatan pk
            WHERE pk.id_kegiatans = k.id_kegiatans
              AND COALESCE(pk.status, '${PersyaratanStatus.WAITING_UPLOAD}') <> '${PersyaratanStatus.APPROVED}'
          )
      `,
      [date],
    );

    const openingRows = await this.programRepo.manager.query(
      `
        SELECT DISTINCT
          p.*,
          f.id_fase,
          f.nama_fase,
          first_kegiatan.tanggal_mulai
        FROM t_program p
        JOIN t_fase f ON f.id_program = p.id_program
        JOIN LATERAL (
          SELECT k.tanggal_mulai
          FROM t_kegiatans k
          WHERE k.id_fase = f.id_fase
          ORDER BY k.urutan ASC, k.id_kegiatans ASC
          LIMIT 1
        ) first_kegiatan ON true
        WHERE first_kegiatan.tanggal_mulai = $1::date
          AND EXISTS (
            SELECT 1
            FROM t_termin t
            JOIN t_persyaratan_termin pt ON pt.id_termin = t.id_termin
            WHERE t.id_fase = f.id_fase
              AND COALESCE(pt.status, '${PersyaratanStatus.WAITING_UPLOAD}') <> '${PersyaratanStatus.APPROVED}'
          )
      `,
      [date],
    );

    const rows: any[] = [];

    const hoRows = await this.programRepo.manager.query(
      `
        SELECT id_user, jenis, sub_jenis, jabatan
        FROM m_users
        WHERE id_role = 3
          AND status = true
      `,
    );

    const audienceCache = new Map<
      number,
      ReturnType<ProgramService['getProgramNotificationAudience']>
    >();
    const getAudienceCached = (item: any) => {
      const key = Number(item.id_program);
      let cached = audienceCache.get(key);
      if (!cached) {
        cached = this.getProgramNotificationAudience(item, hoRows);
        audienceCache.set(key, cached);
      }
      return cached;
    };

    await Promise.all(
      activityRows.map(async (item) => {
      const audience = await getAudienceCached(item);
      const pushUserRows = (
        ids: number[],
        scope: string,
        targetUrl: string,
      ) => {
        ids.forEach((idUser) => {
          rows.push({
            recipientType: NotificationRecipientType.USER,
            recipientId: idUser,
            legacyUserId: idUser,
            judul: 'Reminder tenggat aktivitas',
            pesan: `Besok adalah tenggat aktivitas "${item.nama_kegiatans}" pada program "${item.nama_program}". Pastikan bukti sudah lengkap.`,
            tipe: 'PROGRAM_ACTIVITY_DEADLINE',
            targetUrl,
            metadata: {
              id_program: item.id_program,
              id_kegiatans: item.id_kegiatans,
              due_date: date,
            },
            dedupeKey: `program-deadline:activity:${scope}:${item.id_kegiatans}:${idUser}:${date}`,
          });
        });
      };

      pushUserRows(audience.hoUserIds, 'ho', this.getHoProgramTargetUrl(item));
      pushUserRows(
        audience.aoUserIds,
        'ao',
        `/ao/program/detail/${item.id_program}`,
      );
      pushUserRows(
        audience.vendorUserIds,
        'vendor',
        `/vendor/program/detail/${item.id_program}`,
      );
      pushUserRows(audience.schoolUserIds, 'school', '/sekolah/program');

      audience.guruIds.forEach((idGuru) => {
        rows.push({
          recipientType: NotificationRecipientType.GURU_ASSESSMENT,
          recipientId: idGuru,
          judul: 'Reminder aktivitas program',
          pesan: `Besok adalah tenggat aktivitas "${item.nama_kegiatans}". Pantau program sekolah Anda.`,
          tipe: 'PROGRAM_ACTIVITY_DEADLINE',
          targetUrl: '/sekolah/program',
          metadata: {
            id_program: item.id_program,
            id_kegiatans: item.id_kegiatans,
            due_date: date,
          },
          dedupeKey: `program-deadline:activity-guru:${item.id_kegiatans}:${idGuru}:${date}`,
        });
      });
      }),
    );

    await Promise.all(
      openingRows.map(async (item) => {
      const audience = await getAudienceCached(item);
      const pushUserRows = (
        ids: number[],
        scope: string,
        targetUrl: string,
      ) => {
        ids.forEach((idUser) => {
          rows.push({
            recipientType: NotificationRecipientType.USER,
            recipientId: idUser,
            legacyUserId: idUser,
            judul: 'Reminder administrasi pembuka',
            pesan: `Administrasi pembuka periode "${item.nama_fase}" pada program "${item.nama_program}" belum lengkap. Aktivitas dimulai besok.`,
            tipe: 'PROGRAM_OPENING_DEADLINE',
            targetUrl,
            metadata: {
              id_program: item.id_program,
              id_fase: item.id_fase,
              due_date: date,
            },
            dedupeKey: `program-deadline:opening:${scope}:${item.id_fase}:${idUser}:${date}`,
          });
        });
      };

      pushUserRows(audience.hoUserIds, 'ho', this.getHoProgramTargetUrl(item));
      pushUserRows(
        audience.aoUserIds,
        'ao',
        `/ao/program/detail/${item.id_program}`,
      );
      pushUserRows(
        audience.vendorUserIds,
        'vendor',
        `/vendor/program/detail/${item.id_program}`,
      );
      pushUserRows(audience.schoolUserIds, 'school', '/sekolah/program');

      audience.guruIds.forEach((idGuru) => {
        rows.push({
          recipientType: NotificationRecipientType.GURU_ASSESSMENT,
          recipientId: idGuru,
          judul: 'Reminder administrasi program',
          pesan: `Administrasi pembuka periode "${item.nama_fase}" belum lengkap. Aktivitas program sekolah dimulai besok.`,
          tipe: 'PROGRAM_OPENING_DEADLINE',
          targetUrl: '/sekolah/program',
          metadata: {
            id_program: item.id_program,
            id_fase: item.id_fase,
            due_date: date,
          },
          dedupeKey: `program-deadline:opening-guru:${item.id_fase}:${idGuru}:${date}`,
        });
      });
      }),
    );

    const created = await this.notifikasiService.dispatchMany(rows);

    return {
      date,
      scanned: {
        activityDeadline: activityRows.length,
        openingDeadline: openingRows.length,
      },
      created: created.length,
    };
  }

  async create(
    createProgramDto: CreateProgramDto,
    file: Express.Multer.File,
    id_user: number,
    id_role?: number | null,
  ) {
    if (file) {
      await this.ensureGoogleDriveConnected(
        id_user,
        'Akun Anda belum tertaut ke Google Drive. Hubungkan Google Drive terlebih dahulu untuk mengunggah MOU.',
      );
    }

    const queryRunner = this.programRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      if (!idSekolah)
        throw new BadRequestException('Sekolah sasaran wajib dipilih.');
      if (!idPengawas)
        throw new BadRequestException('Area Officer wajib dipilih.');

      const finalSekolahIds = sekolahIds.length ? sekolahIds : [idSekolah];
      const finalAoIds = aoIds.length ? aoIds : [idPengawas];

      await this.validateHoSchoolAccess(id_user, id_role, finalSekolahIds);

      const kategori = this.normalizeProgramCategory(createProgramDto.kategori);
      const pilarProgram = this.normalizeProgramPilar(
        createProgramDto.pilar_program,
      );

      this.validateProgramPilar(kategori, pilarProgram);

      const fases = this.parseFases(createProgramDto.fases).filter((fase) =>
        String(fase?.nama_fase || '').trim(),
      );

      if (fases.length === 0) {
        throw new BadRequestException(
          'Minimal satu periode program wajib diisi.',
        );
      }

      for (const fase of fases) {
        const terminList = Array.isArray(fase.termin) ? fase.termin : [];
        const kegiatanList = Array.isArray(fase.kegiatans)
          ? fase.kegiatans
          : [];

        if (terminList.length === 0) {
          throw new BadRequestException(
            'Setiap periode wajib memiliki administrasi pembuka.',
          );
        }

        if (kegiatanList.length === 0) {
          throw new BadRequestException(
            'Setiap periode wajib memiliki minimal satu aktivitas.',
          );
        }

        for (const termin of terminList) {
          const persyaratan = Array.isArray(termin.persyaratan)
            ? termin.persyaratan
            : [];

          if (!String(termin?.nama_termin || '').trim()) {
            throw new BadRequestException(
              'Nama administrasi pembuka wajib diisi.',
            );
          }

          if (persyaratan.length === 0) {
            throw new BadRequestException(
              'Administrasi pembuka wajib memiliki minimal satu bukti upload.',
            );
          }
        }

        for (const kegiatan of kegiatanList) {
          const persyaratan = Array.isArray(kegiatan.persyaratan)
            ? kegiatan.persyaratan
            : [];

          if (!String(kegiatan?.nama_kegiatans || '').trim()) {
            throw new BadRequestException('Nama aktivitas wajib diisi.');
          }

          if (persyaratan.length === 0) {
            throw new BadRequestException(
              'Aktivitas wajib memiliki minimal satu bukti upload.',
            );
          }
        }
      }

      const program = this.programRepo.create({
        nama_program: createProgramDto.nama_program,
        deskripsi: createProgramDto.deskripsi || null,
        id_sekolah: idSekolah,
        id_pengawas: idPengawas,
        id_vendor: vendorIds,
        vendor_ids: vendorIds,
        sekolah_ids: finalSekolahIds,
        ao_ids: finalAoIds,
        kategori,
        pilar_program: pilarProgram,
        jenis_program: createProgramDto.jenis_program || 'PROJECT',
        tahun: this.toNumber(createProgramDto.tahun),
        tanggal_mulai: createProgramDto.tanggal_mulai
          ? new Date(createProgramDto.tanggal_mulai)
          : null,
        tanggal_selesai: createProgramDto.tanggal_selesai
          ? new Date(createProgramDto.tanggal_selesai)
          : null,
        status_program: createProgramDto.status_program || 'Approval',
        dibuat_oleh: id_user,
        file_mou: null,
        nomor_mou: createProgramDto.nomor_mou || null,
        harga_vendor: this.toNumber(createProgramDto.harga_vendor, 0),
        kpi_nama: createProgramDto.kpi_nama || null,
        kpi_target: this.toNumber(createProgramDto.kpi_target, 0),
        kpi_satuan: createProgramDto.kpi_satuan || null,
      });

      const savedProgram = await queryRunner.manager.save(Program, program);

      if (file) {
        const uploadedMou = await this.googleDriveService.uploadFile({
          idUser: id_user,
          idRole: id_role || null,
          file,
          moduleType: 'PROGRAM_MOU',
          relatedTable: 't_program',
          relatedId: savedProgram.id_program,
        });

        const driveFile = uploadedMou.file;

        savedProgram.file_mou =
          driveFile?.web_view_link ||
          driveFile?.drive_file_id ||
          file.originalname;

        await queryRunner.manager.save(Program, savedProgram);

        const dokumen = this.dokumenProgramRepo.create({
          id_program: savedProgram.id_program,
          jenis_dokumen: 'MOU',
          nama_file: file.originalname,
          file_path:
            driveFile?.web_view_link ||
            driveFile?.web_content_link ||
            driveFile?.drive_file_id ||
            file.originalname,
          upload_by: id_user,
        });

        await queryRunner.manager.save(DokumenProgram, dokumen);
      }

      const pendingPersyaratanTermin: PersyaratanTermin[] = [];
      const pendingKegiatanPertemuan: KegiatanPertemuan[] = [];
      const pendingPersyaratanKegiatan: PersyaratanKegiatan[] = [];

      for (let faseIndex = 0; faseIndex < fases.length; faseIndex++) {
        const fData = fases[faseIndex];
        if (!fData?.nama_fase?.trim()) continue;

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
          if (!tData?.nama_termin?.trim()) continue;

          const termin = this.terminRepo.create({
            nama_termin: tData.nama_termin.trim(),
            deskripsi: tData.deskripsi || null,
            jumlah_pembayaran: this.toNumber(tData.jumlah_pembayaran, 0),
            status: PersyaratanStatus.WAITING_UPLOAD,
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
            if (!req?.nama?.trim()) continue;

            pendingPersyaratanTermin.push(
              this.persyaratanTerminRepo.create({
                id_termin: savedTermin.id_termin,
                nama: req.nama.trim(),
                tipe: req.tipe || 'upload',
                deskripsi: req.deskripsi || null,
                urutan: this.toNumber(req.urutan, syaratIndex + 1),
                status: PersyaratanStatus.WAITING_UPLOAD,
              }),
            );
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
          if (!kegData?.nama_kegiatans?.trim()) continue;

          const kegiatan = this.kegiatansRepo.create({
            nama_kegiatans: kegData.nama_kegiatans.trim(),
            deskripsi: kegData.deskripsi || null,
            urutan: this.toNumber(kegData.urutan, kegiatanIndex + 1),
            tanggal_mulai: kegData.tanggal_mulai
              ? new Date(kegData.tanggal_mulai)
              : null,
            tanggal_selesai: kegData.tanggal_selesai
              ? new Date(kegData.tanggal_selesai)
              : null,
            id_fase: savedFase.id_fase,
            status_kegiatan: 'LOCKED',
          });

          const savedKegiatan = await queryRunner.manager.save(
            Kegiatans,
            kegiatan,
          );

          const pertemuanList = Array.isArray(kegData.pertemuan)
            ? kegData.pertemuan
            : [];

          for (
            let pertemuanIndex = 0;
            pertemuanIndex < pertemuanList.length;
            pertemuanIndex++
          ) {
            const pertemuanData = pertemuanList[pertemuanIndex];
            if (!pertemuanData?.nama_pertemuan?.trim()) continue;

            pendingKegiatanPertemuan.push(
              this.kegiatanPertemuanRepo.create({
                id_kegiatans: savedKegiatan.id_kegiatans,
                nama_pertemuan: pertemuanData.nama_pertemuan.trim(),
                deskripsi: pertemuanData.deskripsi || null,
                tanggal_mulai: pertemuanData.tanggal_mulai
                  ? new Date(pertemuanData.tanggal_mulai)
                  : null,
                tanggal_selesai: pertemuanData.tanggal_selesai
                  ? new Date(pertemuanData.tanggal_selesai)
                  : null,
                urutan: this.toNumber(pertemuanData.urutan, pertemuanIndex + 1),
                status: pertemuanData.status || 'PLANNED',
              }),
            );
          }

          const persyaratanKegiatan = Array.isArray(kegData.persyaratan)
            ? kegData.persyaratan
            : [];

          for (
            let syaratIndex = 0;
            syaratIndex < persyaratanKegiatan.length;
            syaratIndex++
          ) {
            const req = persyaratanKegiatan[syaratIndex];
            if (!req?.nama?.trim()) continue;

            pendingPersyaratanKegiatan.push(
              this.persyaratanKegiatanRepo.create({
                id_kegiatans: savedKegiatan.id_kegiatans,
                nama: req.nama.trim(),
                tipe: req.tipe || 'upload',
                deskripsi: req.deskripsi || null,
                urutan: this.toNumber(req.urutan, syaratIndex + 1),
                status: PersyaratanStatus.WAITING_UPLOAD,
              }),
            );
          }
        }
      }

      if (pendingPersyaratanTermin.length > 0) {
        await queryRunner.manager.save(
          PersyaratanTermin,
          pendingPersyaratanTermin,
        );
      }
      if (pendingKegiatanPertemuan.length > 0) {
        await queryRunner.manager.save(
          KegiatanPertemuan,
          pendingKegiatanPertemuan,
        );
      }
      if (pendingPersyaratanKegiatan.length > 0) {
        await queryRunner.manager.save(
          PersyaratanKegiatan,
          pendingPersyaratanKegiatan,
        );
      }

      await queryRunner.commitTransaction();
      await this.notifyProgramCreated(savedProgram, id_user).catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`PROGRAM_CREATED_NOTIFICATION_ERROR: ${message}`);
      });
      return this.findOne(savedProgram.id_program);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof HttpException) {
        throw error;
      }

      const msg = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Gagal simpan program: ${msg}`);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    kategori?: string,
    jenis_program?: string,
    page?: string,
    limit?: string,
    include?: string,
  ) {
    const where: any = {};
    if (kategori) where.kategori = kategori;
    if (jenis_program) where.jenis_program = jenis_program;

    const includeFases = String(include || '')
      .split(',')
      .map((s) => s.trim())
      .includes('fases');
    const relations = includeFases ? this.PROGRAM_FASES_RELATIONS : undefined;

    const pagination = parsePagination(page, limit);

    if (!pagination) {
      const programs = await this.programRepo.find({
        where,
        relations,
        order: { created_at: 'DESC' },
      });

      return this.hydrateProgramPersonas(programs);
    }

    const [programs, total] = await this.programRepo.findAndCount({
      where,
      relations,
      order: { created_at: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    const hydrated = await this.hydrateProgramPersonas(programs);
    return toPaginatedResult(hydrated as any[], total, pagination);
  }

  async findBySekolah(id_sekolah: number) {
    const idSekolah = Number(id_sekolah);
    if (!idSekolah || Number.isNaN(idSekolah)) {
      throw new BadRequestException('ID sekolah tidak valid');
    }

    const programs = await this.programRepo
      .createQueryBuilder('p')
      .where('p.id_sekolah = :id_sekolah', { id_sekolah: idSekolah })
      .orWhere(':id_sekolah = ANY(p.sekolah_ids)', { id_sekolah: idSekolah })
      .orderBy('p.created_at', 'DESC')
      .getMany();

    return this.hydrateProgramPersonas(programs);
  }

  async findOne(id: number) {
    const program = await this.programRepo.findOne({
      where: { id_program: id },
      relations: this.PROGRAM_FASES_RELATIONS,
      order: {
        fases: {
          urutan: 'ASC',
          termin: {
            created_at: 'ASC',
            persyaratan: { urutan: 'ASC' },
          },
          kegiatans: {
            urutan: 'ASC',
            persyaratan: { urutan: 'ASC' },
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException(`Program #${id} tidak ditemukan`);
    }

    return this.hydrateProgramPersonas(program);
  }

  async getRatingSummary(id_program: number) {
    const program = await this.programRepo.findOne({
      where: { id_program },
    });

    if (!program) {
      throw new NotFoundException('Program tidak ditemukan');
    }

    const sekolahIds = this.toArray(program.sekolah_ids).length
      ? this.toArray(program.sekolah_ids)
      : program.id_sekolah
        ? [Number(program.id_sekolah)]
        : [];

    const activities = await this.programRepo.manager.query(
      `
        SELECT k.id_kegiatans, k.nama_kegiatans, k.status_kegiatan
        FROM t_kegiatans k
        JOIN t_fase f ON f.id_fase = k.id_fase
        WHERE f.id_program = $1
        ORDER BY f.urutan ASC, k.urutan ASC, k.id_kegiatans ASC
      `,
      [id_program],
    );

    const approvedActivities = activities.filter(
      (item: any) =>
        String(item.status_kegiatan || '').toUpperCase() === 'APPROVED',
    );

    const ratingRows = await this.programRepo.manager.query(
      `
        SELECT
          kr.*,
          k.nama_kegiatans
        FROM t_kegiatan_rating kr
        JOIN t_kegiatans k ON k.id_kegiatans = kr.id_kegiatans
        JOIN t_fase f ON f.id_fase = k.id_fase
        WHERE f.id_program = $1
      `,
      [id_program],
    );

    const expectedGuruRows = sekolahIds.length
      ? await this.programRepo.manager.query(
          `
            SELECT id_guru_assessment
            FROM assessment_guru
            WHERE id_sekolah = ANY($1::int[])
              AND is_active = true
          `,
          [sekolahIds],
        )
      : [];

    const expectedGuruCount = expectedGuruRows.length;
    const guruRatings = ratingRows.filter(
      (item: any) => String(item.rater_type || '').toUpperCase() === 'GURU',
    );
    const vendorRatings = ratingRows.filter(
      (item: any) => String(item.rater_type || '').toUpperCase() === 'VENDOR',
    );

    const averageRating = ratingRows.length
      ? ratingRows.reduce(
          (total: number, item: any) => total + Number(item.rating || 0),
          0,
        ) / ratingRows.length
      : 0;

    const expectedGuruRatingSlots =
      expectedGuruCount * approvedActivities.length;

    const activityBreakdown = approvedActivities.map((activity: any) => {
      const activityRatings = ratingRows.filter(
        (item: any) =>
          Number(item.id_kegiatans) === Number(activity.id_kegiatans),
      );
      const activityGuruRatings = activityRatings.filter(
        (item: any) => String(item.rater_type || '').toUpperCase() === 'GURU',
      );
      const activityAverage = activityRatings.length
        ? activityRatings.reduce(
            (total: number, item: any) => total + Number(item.rating || 0),
            0,
          ) / activityRatings.length
        : 0;

      return {
        id_kegiatans: activity.id_kegiatans,
        nama_kegiatans: activity.nama_kegiatans,
        average_rating: Number(activityAverage.toFixed(2)),
        total_rating: activityRatings.length,
        guru_rating_count: activityGuruRatings.length,
        expected_guru_count: expectedGuruCount,
        missing_guru_rating: Math.max(
          expectedGuruCount - activityGuruRatings.length,
          0,
        ),
      };
    });

    return {
      id_program,
      average_rating: Number(averageRating.toFixed(2)),
      total_rating: ratingRows.length,
      guru_rating_count: guruRatings.length,
      vendor_rating_count: vendorRatings.length,
      expected_guru_count: expectedGuruCount,
      approved_activity_count: approvedActivities.length,
      expected_guru_rating_slots: expectedGuruRatingSlots,
      missing_guru_rating: Math.max(
        expectedGuruRatingSlots - guruRatings.length,
        0,
      ),
      participation_percentage: expectedGuruRatingSlots
        ? Math.round((guruRatings.length / expectedGuruRatingSlots) * 100)
        : 0,
      activities: activityBreakdown,
    };
  }

  async uploadPersyaratanTermin(
    id_persyaratan: number,
    file: Express.Multer.File,
    body: any,
    id_user: number,
    role_user: string,
    id_role?: number | null,
  ) {
    const persyaratan = await this.persyaratanTerminRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan termin tidak ditemukan');
    }

    if (!this.isVendorRole(role_user)) {
      throw new BadRequestException(
        'Akses ditolak: hanya Vendor/Narasumber yang boleh upload bukti administratif',
      );
    }

    if (persyaratan.status === PersyaratanStatus.APPROVED) {
      throw new BadRequestException(
        'Bukti sudah disetujui HO dan tidak bisa diupload ulang',
      );
    }

    if ([PersyaratanStatus.WAITING_AO, PersyaratanStatus.WAITING_HO].includes(persyaratan.status)) {
      throw new BadRequestException(
        'Bukti sedang dalam proses review. Tunggu hasil review terlebih dahulu.',
      );
    }

    if (persyaratan.tipe === 'upload' && !file) {
      throw new BadRequestException('File wajib diupload');
    }

    if (file) {
      const uploaded = await this.googleDriveService.uploadFile({
        idUser: id_user,
        idRole: id_role || null,
        file,
        moduleType: 'PROGRAM_TERMIN',
        relatedTable: 't_persyaratan_termin',
        relatedId: persyaratan.id_persyaratan,
        notConnectedMessage:
          'Akun Anda belum tertaut ke Google Drive. Hubungkan Google Drive terlebih dahulu untuk mengunggah bukti administratif termin.',
      });

      persyaratan.file_path = this.getDriveFilePath(
        uploaded,
        file.originalname,
      );
      persyaratan.nama_file = file.originalname;
    }

    persyaratan.status = PersyaratanStatus.WAITING_AO;
    persyaratan.uploaded_by = id_user;
    persyaratan.uploaded_at = new Date();

    persyaratan.approved_by = null;
    persyaratan.approved_at = null;

    persyaratan.rejected_by = null;
    persyaratan.rejected_at = null;
    persyaratan.rejected_reason = null;

    persyaratan.updated_at = new Date();

    await this.persyaratanTerminRepo.save(persyaratan);

    const program = await this.getProgramByTermin(persyaratan.id_termin);
    await this.notifyProgramEvidenceWorkflow(program, {
      audience: 'UPLOAD',
      idPersyaratan: persyaratan.id_persyaratan,
      evidenceType: 'ADMINISTRASI',
      requirementName: persyaratan.nama,
      contextName: program?.nama_termin || program?.nama_fase,
      actorUserId: id_user,
      idTermin: persyaratan.id_termin,
    });

    return {
      message: 'Upload bukti administratif berhasil, menunggu review AO',
      data: persyaratan,
    };
  }

  async aoApprovePersyaratanTermin(
    id_persyaratan: number,
    id_user: number,
    role_user: string,
    body: any,
  ) {
    if (!this.isAORole(role_user)) {
      throw new BadRequestException(
        'Akses ditolak: hanya AO yang boleh review',
      );
    }

    const persyaratan = await this.persyaratanTerminRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan termin tidak ditemukan');
    }

    if (persyaratan.status !== PersyaratanStatus.WAITING_AO) {
      throw new BadRequestException(
        'Persyaratan belum dalam status menunggu review AO',
      );
    }

    persyaratan.status = PersyaratanStatus.WAITING_HO;

    persyaratan.rejected_by = null;
    persyaratan.rejected_at = null;
    persyaratan.rejected_reason = null;

    persyaratan.updated_at = new Date();

    await this.persyaratanTerminRepo.save(persyaratan);

    const program = await this.getProgramByTermin(persyaratan.id_termin);
    await this.notifyProgramEvidenceWorkflow(program, {
      audience: 'AO_APPROVED',
      idPersyaratan: persyaratan.id_persyaratan,
      evidenceType: 'ADMINISTRASI',
      requirementName: persyaratan.nama,
      contextName: program?.nama_termin || program?.nama_fase,
      actorUserId: id_user,
      idTermin: persyaratan.id_termin,
    });

    return {
      message: 'Review AO disetujui, bukti administratif diteruskan ke HO',
      data: persyaratan,
    };
  }

  async aoRejectPersyaratanTermin(
    id_persyaratan: number,
    id_user: number,
    role_user: string,
    body: any,
  ) {
    if (!this.isAORole(role_user)) {
      throw new BadRequestException(
        'Akses ditolak: hanya AO yang boleh review',
      );
    }

    const persyaratan = await this.persyaratanTerminRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan termin tidak ditemukan');
    }

    if (persyaratan.status !== PersyaratanStatus.WAITING_AO) {
      throw new BadRequestException(
        'Persyaratan belum dalam status menunggu review AO',
      );
    }

    persyaratan.status = PersyaratanStatus.REJECTED_AO;

    // Penting: kosongkan file agar vendor wajib upload ulang
    persyaratan.file_path = null;
    persyaratan.nama_file = null;
    persyaratan.uploaded_by = null;
    persyaratan.uploaded_at = null;

    persyaratan.approved_by = null;
    persyaratan.approved_at = null;

    persyaratan.rejected_by = id_user;
    persyaratan.rejected_at = new Date();
    persyaratan.rejected_reason =
      body?.alasan ||
      body?.reason ||
      body?.komentar ||
      'Bukti ditolak AO. Silakan upload ulang.';

    persyaratan.updated_at = new Date();

    await this.persyaratanTerminRepo.save(persyaratan);

    const program = await this.getProgramByTermin(persyaratan.id_termin);
    await this.notifyProgramEvidenceWorkflow(program, {
      audience: 'AO_REJECTED',
      idPersyaratan: persyaratan.id_persyaratan,
      evidenceType: 'ADMINISTRASI',
      requirementName: persyaratan.nama,
      contextName: program?.nama_termin || program?.nama_fase,
      actorUserId: id_user,
      reason: persyaratan.rejected_reason,
      idTermin: persyaratan.id_termin,
    });

    return {
      message: 'Bukti administratif ditolak AO, narasumber perlu upload ulang',
      data: persyaratan,
    };
  }

  async approvePersyaratanTermin(
    id_persyaratan: number,
    id_user: number,
    role_user: string,
  ) {
    if (!this.isHORole(role_user)) {
      throw new BadRequestException(
        'Akses ditolak: hanya HO yang boleh memberi keputusan final',
      );
    }

    const persyaratan = await this.persyaratanTerminRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan termin tidak ditemukan');
    }

    if (persyaratan.status !== PersyaratanStatus.WAITING_HO) {
      throw new BadRequestException(
        'Persyaratan belum dalam status menunggu validasi HO',
      );
    }

    persyaratan.status = PersyaratanStatus.APPROVED;
    persyaratan.approved_by = id_user;
    persyaratan.approved_at = new Date();
    persyaratan.updated_at = new Date();

    await this.persyaratanTerminRepo.save(persyaratan);

    const program = await this.getProgramByTermin(persyaratan.id_termin);
    await this.notifyProgramEvidenceWorkflow(program, {
      audience: 'HO_APPROVED',
      idPersyaratan: persyaratan.id_persyaratan,
      evidenceType: 'ADMINISTRASI',
      requirementName: persyaratan.nama,
      contextName: program?.nama_termin || program?.nama_fase,
      actorUserId: id_user,
      idTermin: persyaratan.id_termin,
    });

    await this.checkAndUnlockKegiatanAfterTerminApproval(persyaratan.id_termin);

    const termin = await this.terminRepo.findOne({
      where: { id_termin: persyaratan.id_termin },
    });

    if (termin?.id_fase) {
      await this.syncProgramStatusByFase(termin.id_fase);
    }

    return {
      message:
        'Administrasi pembuka periode di-ACC HO, aktivitas akan terbuka jika seluruh bukti administratif periode ini telah disetujui',
      data: persyaratan,
    };
  }

  async rejectPersyaratanTermin(
    id_persyaratan: number,
    id_user: number,
    role_user: string,
    body: any,
  ) {
    if (!this.isHORole(role_user)) {
      throw new BadRequestException(
        'Akses ditolak: hanya HO yang boleh memberi keputusan final',
      );
    }

    const persyaratan = await this.persyaratanTerminRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan termin tidak ditemukan');
    }

    if (persyaratan.status !== PersyaratanStatus.WAITING_HO) {
      throw new BadRequestException(
        'Persyaratan belum dalam status menunggu validasi HO',
      );
    }

    persyaratan.status = PersyaratanStatus.REJECTED_HO;

    // Penting: kosongkan file agar vendor wajib upload ulang
    persyaratan.file_path = null;
    persyaratan.nama_file = null;
    persyaratan.uploaded_by = null;
    persyaratan.uploaded_at = null;

    persyaratan.approved_by = null;
    persyaratan.approved_at = null;

    persyaratan.rejected_by = id_user;
    persyaratan.rejected_at = new Date();
    persyaratan.rejected_reason =
      body?.alasan ||
      body?.reason ||
      body?.komentar ||
      'Bukti ditolak HO. Silakan upload ulang.';

    persyaratan.updated_at = new Date();

    await this.persyaratanTerminRepo.save(persyaratan);

    const program = await this.getProgramByTermin(persyaratan.id_termin);
    await this.notifyProgramEvidenceWorkflow(program, {
      audience: 'HO_REJECTED',
      idPersyaratan: persyaratan.id_persyaratan,
      evidenceType: 'ADMINISTRASI',
      requirementName: persyaratan.nama,
      contextName: program?.nama_termin || program?.nama_fase,
      actorUserId: id_user,
      reason: persyaratan.rejected_reason,
      idTermin: persyaratan.id_termin,
    });

    return {
      message: 'Bukti administratif ditolak HO, narasumber perlu upload ulang',
      data: persyaratan,
    };
  }
  async uploadPersyaratanKegiatan(
    id_persyaratan: number,
    file: Express.Multer.File,
    body: any,
    id_user: number,
    role_user: string,
    id_role?: number | null,
  ) {
    const persyaratan = await this.persyaratanKegiatanRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan kegiatan tidak ditemukan');
    }

    if (!this.isVendorRole(role_user)) {
      throw new BadRequestException(
        'Akses ditolak: hanya Vendor/Narasumber yang boleh upload bukti kegiatan',
      );
    }

    if (persyaratan.status === PersyaratanStatus.APPROVED) {
      throw new BadRequestException(
        'Bukti sudah disetujui HO dan tidak bisa diupload ulang',
      );
    }

    if ([PersyaratanStatus.WAITING_AO, PersyaratanStatus.WAITING_HO].includes(persyaratan.status)) {
      throw new BadRequestException(
        'Bukti sedang dalam proses review. Tunggu hasil review terlebih dahulu.',
      );
    }

    if (persyaratan.tipe === 'upload' && !file) {
      throw new BadRequestException('File wajib diupload');
    }

    if (file) {
      const uploaded = await this.googleDriveService.uploadFile({
        idUser: id_user,
        idRole: id_role || null,
        file,
        moduleType: 'PROGRAM_KEGIATAN',
        relatedTable: 't_persyaratan_kegiatan',
        relatedId: persyaratan.id_persyaratan,
        notConnectedMessage:
          'Akun Anda belum tertaut ke Google Drive. Hubungkan Google Drive terlebih dahulu untuk mengunggah bukti kegiatan.',
      });

      persyaratan.file_path = this.getDriveFilePath(
        uploaded,
        file.originalname,
      );
      persyaratan.nama_file = file.originalname;
    }

    persyaratan.status = PersyaratanStatus.WAITING_AO;
    persyaratan.uploaded_by = id_user;
    persyaratan.uploaded_at = new Date();

    persyaratan.ao_reviewed_by = null;
    persyaratan.ao_reviewed_at = null;

    persyaratan.approved_by = null;
    persyaratan.approved_at = null;

    persyaratan.rejected_by = null;
    persyaratan.rejected_at = null;
    persyaratan.rejected_reason = null;

    persyaratan.updated_at = new Date();

    await this.persyaratanKegiatanRepo.save(persyaratan);

    const program = await this.getProgramByKegiatan(persyaratan.id_kegiatans);
    await this.notifyProgramEvidenceWorkflow(program, {
      audience: 'UPLOAD',
      idPersyaratan: persyaratan.id_persyaratan,
      evidenceType: 'KEGIATAN',
      requirementName: persyaratan.nama,
      contextName: program?.nama_kegiatans || program?.nama_fase,
      actorUserId: id_user,
      idKegiatans: persyaratan.id_kegiatans,
    });

    return {
      message: 'Upload bukti kegiatan berhasil, menunggu review AO',
      data: persyaratan,
    };
  }

  async aoApprovePersyaratanKegiatan(
    id_persyaratan: number,
    id_user: number,
    role_user: string,
    body: any,
  ) {
    if (!this.isAORole(role_user)) {
      throw new BadRequestException(
        'Akses ditolak: hanya AO yang boleh review',
      );
    }

    const persyaratan = await this.persyaratanKegiatanRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan kegiatan tidak ditemukan');
    }

    if (persyaratan.status !== PersyaratanStatus.WAITING_AO) {
      throw new BadRequestException(
        'Persyaratan belum dalam status menunggu review AO',
      );
    }

    persyaratan.status = PersyaratanStatus.WAITING_HO;
    persyaratan.ao_reviewed_by = id_user;
    persyaratan.ao_reviewed_at = new Date();

    persyaratan.rejected_by = null;
    persyaratan.rejected_at = null;
    persyaratan.rejected_reason = null;

    persyaratan.updated_at = new Date();

    await this.persyaratanKegiatanRepo.save(persyaratan);

    const program = await this.getProgramByKegiatan(persyaratan.id_kegiatans);
    await this.notifyProgramEvidenceWorkflow(program, {
      audience: 'AO_APPROVED',
      idPersyaratan: persyaratan.id_persyaratan,
      evidenceType: 'KEGIATAN',
      requirementName: persyaratan.nama,
      contextName: program?.nama_kegiatans || program?.nama_fase,
      actorUserId: id_user,
      idKegiatans: persyaratan.id_kegiatans,
    });

    return {
      message: 'Review AO disetujui, bukti kegiatan diteruskan ke HO',
      data: persyaratan,
    };
  }

  async aoRejectPersyaratanKegiatan(
    id_persyaratan: number,
    id_user: number,
    role_user: string,
    body: any,
  ) {
    if (!this.isAORole(role_user)) {
      throw new BadRequestException(
        'Akses ditolak: hanya AO yang boleh review',
      );
    }

    const persyaratan = await this.persyaratanKegiatanRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan kegiatan tidak ditemukan');
    }

    if (persyaratan.status !== PersyaratanStatus.WAITING_AO) {
      throw new BadRequestException(
        'Persyaratan belum dalam status menunggu review AO',
      );
    }

    persyaratan.status = PersyaratanStatus.REJECTED_AO;

    // Penting: kosongkan file agar vendor wajib upload ulang
    persyaratan.file_path = null;
    persyaratan.nama_file = null;
    persyaratan.uploaded_by = null;
    persyaratan.uploaded_at = null;

    persyaratan.ao_reviewed_by = id_user;
    persyaratan.ao_reviewed_at = new Date();

    persyaratan.approved_by = null;
    persyaratan.approved_at = null;

    persyaratan.rejected_by = id_user;
    persyaratan.rejected_at = new Date();
    persyaratan.rejected_reason =
      body?.alasan ||
      body?.reason ||
      body?.komentar ||
      'Bukti ditolak AO. Silakan upload ulang.';

    persyaratan.updated_at = new Date();

    await this.persyaratanKegiatanRepo.save(persyaratan);

    const program = await this.getProgramByKegiatan(persyaratan.id_kegiatans);
    await this.notifyProgramEvidenceWorkflow(program, {
      audience: 'AO_REJECTED',
      idPersyaratan: persyaratan.id_persyaratan,
      evidenceType: 'KEGIATAN',
      requirementName: persyaratan.nama,
      contextName: program?.nama_kegiatans || program?.nama_fase,
      actorUserId: id_user,
      reason: persyaratan.rejected_reason,
      idKegiatans: persyaratan.id_kegiatans,
    });

    return {
      message: 'Bukti kegiatan ditolak AO, narasumber perlu upload ulang',
      data: persyaratan,
    };
  }

  async approvePersyaratanKegiatan(
    id_persyaratan: number,
    id_user: number,
    role_user: string,
  ) {
    if (!this.isHORole(role_user)) {
      throw new BadRequestException(
        'Akses ditolak: hanya HO yang boleh memberi keputusan final',
      );
    }

    const persyaratan = await this.persyaratanKegiatanRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan kegiatan tidak ditemukan');
    }

    if (persyaratan.status !== PersyaratanStatus.WAITING_HO) {
      throw new BadRequestException(
        'Persyaratan belum dalam status menunggu validasi HO',
      );
    }

    persyaratan.status = PersyaratanStatus.APPROVED;
    persyaratan.approved_by = id_user;
    persyaratan.approved_at = new Date();
    persyaratan.updated_at = new Date();

    await this.persyaratanKegiatanRepo.save(persyaratan);

    const program = await this.getProgramByKegiatan(persyaratan.id_kegiatans);
    await this.notifyProgramEvidenceWorkflow(program, {
      audience: 'HO_APPROVED',
      idPersyaratan: persyaratan.id_persyaratan,
      evidenceType: 'KEGIATAN',
      requirementName: persyaratan.nama,
      contextName: program?.nama_kegiatans || program?.nama_fase,
      actorUserId: id_user,
      idKegiatans: persyaratan.id_kegiatans,
    });

    await this.checkAndFinalizeKegiatan(persyaratan.id_kegiatans, id_user);

    const kegiatan = await this.kegiatansRepo.findOne({
      where: { id_kegiatans: persyaratan.id_kegiatans },
    });

    if (kegiatan?.id_fase) {
      await this.syncProgramStatusByFase(kegiatan.id_fase);
    }

    return {
      message: 'Bukti kegiatan di-ACC HO',
      data: persyaratan,
    };
  }

  async rejectPersyaratanKegiatan(
    id_persyaratan: number,
    id_user: number,
    role_user: string,
    body: any,
  ) {
    if (!this.isHORole(role_user)) {
      throw new BadRequestException(
        'Akses ditolak: hanya HO yang boleh memberi keputusan final',
      );
    }

    const persyaratan = await this.persyaratanKegiatanRepo.findOne({
      where: { id_persyaratan },
    });

    if (!persyaratan) {
      throw new NotFoundException('Persyaratan kegiatan tidak ditemukan');
    }

    if (persyaratan.status !== PersyaratanStatus.WAITING_HO) {
      throw new BadRequestException(
        'Persyaratan belum dalam status menunggu validasi HO',
      );
    }

    persyaratan.status = PersyaratanStatus.REJECTED_HO;

    // Penting: kosongkan file agar vendor wajib upload ulang
    persyaratan.file_path = null;
    persyaratan.nama_file = null;
    persyaratan.uploaded_by = null;
    persyaratan.uploaded_at = null;

    persyaratan.approved_by = null;
    persyaratan.approved_at = null;

    persyaratan.rejected_by = id_user;
    persyaratan.rejected_at = new Date();
    persyaratan.rejected_reason =
      body?.alasan ||
      body?.reason ||
      body?.komentar ||
      'Bukti ditolak HO. Silakan upload ulang.';

    persyaratan.updated_at = new Date();

    await this.persyaratanKegiatanRepo.save(persyaratan);

    const program = await this.getProgramByKegiatan(persyaratan.id_kegiatans);
    await this.notifyProgramEvidenceWorkflow(program, {
      audience: 'HO_REJECTED',
      idPersyaratan: persyaratan.id_persyaratan,
      evidenceType: 'KEGIATAN',
      requirementName: persyaratan.nama,
      contextName: program?.nama_kegiatans || program?.nama_fase,
      actorUserId: id_user,
      reason: persyaratan.rejected_reason,
      idKegiatans: persyaratan.id_kegiatans,
    });

    return {
      message: 'Bukti kegiatan ditolak HO, narasumber perlu upload ulang',
      data: persyaratan,
    };
  }

  private async checkAndUnlockKegiatanAfterTerminApproval(id_termin: number) {
    try {
      const termin = await this.terminRepo.findOne({
        where: { id_termin },
        relations: ['persyaratan'],
      });

      if (!termin || !termin.id_fase) return;

      const allTerminInFase = await this.terminRepo.find({
        where: { id_fase: termin.id_fase },
        relations: ['persyaratan'],
      });

      const terminPembukaPeriode = allTerminInFase.filter(
        (item) => !item.id_kegiatans,
      );

      const allApproved = terminPembukaPeriode.every(
        (item) =>
          item.persyaratan.length > 0 &&
          item.persyaratan.every((p) => p.status === PersyaratanStatus.APPROVED),
      );

      if (!allApproved) return;

      const kegiatan = await this.kegiatansRepo.find({
        where: { id_fase: termin.id_fase },
        order: { urutan: 'ASC' },
      });

      if (kegiatan.length === 0) return;

      const first = kegiatan[0];
      if (first.status_kegiatan === 'LOCKED') {
        first.status_kegiatan = 'UNLOCKED';
        await this.kegiatansRepo.save(first);
      }
    } catch (error) {
      this.logger.error('checkAndUnlockKegiatanAfterTerminApproval error:', error);
    }
  }

  private async checkAndFinalizeKegiatan(
    id_kegiatans: number,
    id_user: number,
  ) {
    try {
      const kegiatan = await this.kegiatansRepo.findOne({
        where: { id_kegiatans },
        relations: ['persyaratan'],
      });

      if (!kegiatan) return;

      const allApproved =
        kegiatan.persyaratan.length > 0 &&
        kegiatan.persyaratan.every((p) => p.status === PersyaratanStatus.APPROVED);

      if (!allApproved) return;

      kegiatan.status_kegiatan = 'APPROVED';
      kegiatan.approved_at = new Date();
      await this.kegiatansRepo.save(kegiatan);
      await this.notifyActivityRatingRequest(kegiatan);

      const siblings = await this.kegiatansRepo.find({
        where: { id_fase: kegiatan.id_fase },
        order: { urutan: 'ASC' },
      });

      const currentIndex = siblings.findIndex(
        (item) => item.id_kegiatans === id_kegiatans,
      );

      const nextKegiatan = siblings[currentIndex + 1];
      if (nextKegiatan && nextKegiatan.status_kegiatan === 'LOCKED') {
        nextKegiatan.status_kegiatan = 'UNLOCKED';
        await this.kegiatansRepo.save(nextKegiatan);
      }
    } catch (error) {
      this.logger.error('checkAndFinalizeKegiatan error:', error);
    }
  }

  private async syncProgramStatusByFase(id_fase: number) {
    const fase = await this.faseRepo.findOne({
      where: { id_fase },
    });

    if (!fase?.id_program) return;

    await this.syncProgramStatus(fase.id_program);
  }

  private async syncProgramStatus(id_program: number) {
    const fases = await this.faseRepo.find({
      where: { id_program },
      order: { urutan: 'ASC' },
    });

    if (!fases.length) return;

    const faseIds = fases.map((fase) => fase.id_fase);

    const kegiatanList = await this.kegiatansRepo.find({
      where: faseIds.map((id_fase) => ({ id_fase })),
      relations: ['persyaratan'],
      order: { urutan: 'ASC' },
    });

    const terminList = await this.terminRepo.find({
      where: faseIds.map((id_fase) => ({ id_fase })),
      relations: ['persyaratan'],
    });

    const hasAnyUploadOrApproval =
      terminList.some((termin) =>
        (termin.persyaratan || []).some((item) =>
          [
            PersyaratanStatus.WAITING_AO,
            PersyaratanStatus.WAITING_HO,
            PersyaratanStatus.APPROVED,
            PersyaratanStatus.REJECTED_AO,
            PersyaratanStatus.REJECTED_HO,
          ].includes(item.status),
        ),
      ) ||
      kegiatanList.some((kegiatan) =>
        (kegiatan.persyaratan || []).some((item) =>
          [
            PersyaratanStatus.WAITING_AO,
            PersyaratanStatus.WAITING_HO,
            PersyaratanStatus.APPROVED,
            PersyaratanStatus.REJECTED_AO,
            PersyaratanStatus.REJECTED_HO,
          ].includes(item.status),
        ),
      );

    const allTerminApproved =
      terminList.length === 0 ||
      terminList.every(
        (termin) =>
          (termin.persyaratan || []).length > 0 &&
          termin.persyaratan.every((item) => item.status === PersyaratanStatus.APPROVED),
      );

    const allKegiatanApproved =
      kegiatanList.length === 0 ||
      kegiatanList.every((kegiatan) => {
        const persyaratan = kegiatan.persyaratan || [];

        return (
          kegiatan.status_kegiatan === 'APPROVED' &&
          persyaratan.length > 0 &&
          persyaratan.every((item) => item.status === PersyaratanStatus.APPROVED)
        );
      });

    let nextStatus = 'Approval';

    if (allTerminApproved && allKegiatanApproved) {
      nextStatus = 'Selesai';
    } else if (hasAnyUploadOrApproval) {
      nextStatus = 'Implementasi';
    }

    await this.programRepo.update(id_program, {
      status_program: nextStatus,
      updated_at: new Date(),
    });
  }

  async addComment(
    id_kegiatan: number,
    body: any,
    id_user: number,
    nama_user: string,
    role_user: string,
  ) {
    const kegiatan = await this.kegiatansRepo.findOne({
      where: { id_kegiatans: id_kegiatan },
    });

    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    if (!body?.comment_text?.trim()) {
      throw new BadRequestException('Teks komentar wajib diisi');
    }

    const validTypes = [
      'AO_REVIEW',
      'HO_APPROVAL',
      'GURU_RATING',
      'VENDOR_RATING',
    ];
    const commentType = validTypes.includes(body.comment_type)
      ? body.comment_type
      : 'AO_REVIEW';

    let normalizedRoleUser = role_user;

    if (['GURU_RATING', 'VENDOR_RATING'].includes(commentType)) {
      const expectedRaterType =
        commentType === 'VENDOR_RATING' ? 'VENDOR' : 'GURU';
      const actor = await this.resolveRatingActor(id_user, {
        ...body,
        rater_type: expectedRaterType,
      });

      if (actor.raterType !== expectedRaterType) {
        throw new BadRequestException(
          'Jenis feedback tidak sesuai dengan akun yang login.',
        );
      }

      normalizedRoleUser =
        actor.raterType === 'VENDOR' ? 'Vendor' : 'Guru Assessment';
      await this.ensureProgramFeedbackOpenByKegiatan(id_kegiatan);
    }

    const comment = this.kegiatanCommentRepo.create({
      id_kegiatan,
      id_persyaratan: body.id_persyaratan ? Number(body.id_persyaratan) : null,
      id_user,
      nama_user,
      role_user: normalizedRoleUser,
      comment_text: body.comment_text.trim(),
      comment_type: commentType,
      attachment_file: null,
      attachment_original_name: null,
    });

    const saved = await this.kegiatanCommentRepo.save(comment);

    return {
      message: 'Komentar berhasil ditambahkan',
      data: saved,
    };
  }

  async getCommentsByKegiatan(id_kegiatan: number) {
    const kegiatan = await this.kegiatansRepo.findOne({
      where: { id_kegiatans: id_kegiatan },
    });

    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    return this.kegiatanCommentRepo.find({
      where: { id_kegiatan },
      order: { created_at: 'ASC' },
    });
  }

  async submitGuruRating(
    id_kegiatan: number,
    body: any,
    id_user: number,
    nama_user: string,
  ) {
    const kegiatan = await this.kegiatansRepo.findOne({
      where: { id_kegiatans: id_kegiatan },
      relations: ['persyaratan'],
    });

    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    const statusKegiatan = String(kegiatan.status_kegiatan || '').toUpperCase();
    const hasUnapprovedRequirement = (kegiatan.persyaratan || []).some(
      (item) => String(item.status || '').toUpperCase() !== PersyaratanStatus.APPROVED,
    );

    if (statusKegiatan !== 'APPROVED' || hasUnapprovedRequirement) {
      throw new BadRequestException(
        'Step kegiatan belum selesai. Rating baru dapat diberikan setelah seluruh bukti disetujui HO.',
      );
    }

    const program = await this.ensureProgramFeedbackOpenByKegiatan(id_kegiatan);
    const actor = await this.resolveRatingActor(id_user, body);

    const requestedRaterType = body?.rater_type
      ? String(body.rater_type).toUpperCase()
      : actor.raterType;

    if (requestedRaterType !== actor.raterType) {
      throw new BadRequestException(
        'Jenis pemberi rating tidak sesuai dengan akun yang login.',
      );
    }

    const rating = Number(body.rating);
    if (!rating || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating harus antara 1 sampai 5');
    }

    const raterType = actor.raterType;
    const idGuruAssessment = actor.idGuruAssessment;
    const idVendor = actor.idVendor;
    const idSekolah = actor.idSekolah;

    if (raterType === 'VENDOR') {
      const programVendorIds = Array.from(
        new Set([
          ...this.toArray(program?.id_vendor),
          ...this.toArray(program?.vendor_ids),
        ]),
      );

      if (!idVendor || !programVendorIds.includes(idVendor)) {
        throw new BadRequestException(
          'Vendor tidak terhubung dengan program pada step ini.',
        );
      }
    } else {
      if (!idGuruAssessment || !idSekolah) {
        throw new BadRequestException(
          'Guru Assessment tidak terhubung dengan sekolah.',
        );
      }

      const programSchoolIds = Array.from(
        new Set([
          ...this.toArray(program?.sekolah_ids),
          ...this.toArray(program?.target_sekolah_ids),
          ...(program?.id_sekolah ? [Number(program.id_sekolah)] : []),
        ]),
      );

      if (!programSchoolIds.includes(idSekolah)) {
        throw new BadRequestException(
          'Sekolah Guru Assessment tidak terhubung dengan program pada step ini.',
        );
      }
    }

    let existingRating: KegiatanRating = null;

    if (raterType === 'GURU') {
      existingRating = await this.kegiatanRatingRepo.findOne({
        where: {
          id_kegiatans: id_kegiatan,
          id_guru_assessment: idGuruAssessment,
        },
      });
    } else {
      existingRating = await this.kegiatanRatingRepo.findOne({
        where: { id_kegiatans: id_kegiatan, id_vendor: idVendor },
      });
    }

    const savedRating = await this.kegiatanRatingRepo.save(
      this.kegiatanRatingRepo.create({
        ...(existingRating || {}),
        id_kegiatans: id_kegiatan,
        rater_type: raterType,
        id_user,
        id_guru_assessment: idGuruAssessment,
        id_vendor: idVendor,
        id_sekolah: idSekolah,
        rating,
        komentar: body.comment?.trim() || body.komentar?.trim() || null,
      }),
    );

    if (raterType === 'GURU') {
      kegiatan.guru_rating = rating;
      kegiatan.guru_comment =
        body.comment?.trim() || body.komentar?.trim() || null;
      kegiatan.guru_rated_by = id_user;
      kegiatan.guru_rated_at = new Date();
      await this.kegiatansRepo.save(kegiatan);
    }

    const ratingComment = body.comment?.trim() || body.komentar?.trim() || '';
    const ratingCommentType =
      raterType === 'VENDOR' ? 'VENDOR_RATING' : 'GURU_RATING';

    const existingRatingComment = await this.kegiatanCommentRepo.findOne({
      where: {
        id_kegiatan,
        id_user,
        comment_type: ratingCommentType,
      },
      order: { created_at: 'DESC' },
    });

    if (ratingComment) {
      await this.kegiatanCommentRepo.save(
        this.kegiatanCommentRepo.create({
          ...(existingRatingComment || {}),
          id_kegiatan,
          id_user,
          nama_user,
          role_user: raterType === 'VENDOR' ? 'Vendor' : 'Guru Assessment',
          comment_text: ratingComment,
          comment_type: ratingCommentType,
          attachment_file: null,
          attachment_original_name: null,
        }),
      );
    } else if (existingRatingComment?.id_comment) {
      await this.kegiatanCommentRepo.delete({
        id_comment: existingRatingComment.id_comment,
      });
    }

    const ratings = await this.kegiatanRatingRepo.find({
      where: { id_kegiatans: id_kegiatan },
    });
    const average =
      ratings.length > 0
        ? ratings.reduce((total, item) => total + Number(item.rating || 0), 0) /
          ratings.length
        : rating;

    return {
      message: 'Rating aktivitas berhasil disimpan',
      data: {
        id_rating: savedRating.id_rating,
        rating,
        average_rating: Number(average.toFixed(2)),
        total_rating: ratings.length,
        rater_type: raterType,
      },
    };
  }

  async update(
    id: number,
    updateData: any,
    file: Express.Multer.File,
    id_user: number,
    id_role?: number | null,
  ) {
    const existingProgram = await this.programRepo.findOne({
      where: { id_program: id },
    });

    if (!existingProgram) {
      throw new NotFoundException('Program tidak ditemukan');
    }

    const sekolahIds = this.toArray(updateData.sekolah_ids);
    const aoIds = this.toArray(updateData.ao_ids);
    const vendorIds = this.toArray(
      updateData.vendor_ids?.length
        ? updateData.vendor_ids
        : updateData.id_vendor,
    );

    const idSekolah =
      this.toNumber(updateData.id_sekolah) ||
      sekolahIds[0] ||
      existingProgram.id_sekolah ||
      null;

    const idPengawas =
      this.toNumber(updateData.id_pengawas) ||
      aoIds[0] ||
      existingProgram.id_pengawas ||
      null;

    const finalSekolahIds =
      sekolahIds.length > 0
        ? sekolahIds
        : Array.isArray(existingProgram.sekolah_ids)
          ? existingProgram.sekolah_ids
          : idSekolah
            ? [idSekolah]
            : [];

    const finalAoIds =
      aoIds.length > 0
        ? aoIds
        : Array.isArray(existingProgram.ao_ids)
          ? existingProgram.ao_ids
          : idPengawas
            ? [idPengawas]
            : [];

    const finalVendorIds =
      vendorIds.length > 0
        ? vendorIds
        : Array.isArray(existingProgram.vendor_ids)
          ? existingProgram.vendor_ids
          : this.toArray(existingProgram.id_vendor);

    await this.validateHoSchoolAccess(id_user, id_role, finalSekolahIds);

    const kategori =
      updateData.kategori !== undefined
        ? this.normalizeProgramCategory(updateData.kategori)
        : existingProgram.kategori;

    const pilarProgram =
      updateData.pilar_program !== undefined
        ? this.normalizeProgramPilar(updateData.pilar_program)
        : existingProgram.pilar_program;

    this.validateProgramPilar(kategori, pilarProgram);

    const dataToSave: any = {
      nama_program:
        updateData.nama_program !== undefined
          ? updateData.nama_program
          : existingProgram.nama_program,

      deskripsi:
        updateData.deskripsi !== undefined
          ? updateData.deskripsi || null
          : existingProgram.deskripsi,

      nomor_mou:
        updateData.nomor_mou !== undefined
          ? updateData.nomor_mou || null
          : existingProgram.nomor_mou,

      harga_vendor:
        updateData.harga_vendor !== undefined
          ? this.toNumber(updateData.harga_vendor, 0)
          : existingProgram.harga_vendor,

      kategori,
      pilar_program: pilarProgram,

      jenis_program:
        updateData.jenis_program !== undefined
          ? updateData.jenis_program || 'PROJECT'
          : existingProgram.jenis_program,

      tahun:
        updateData.tahun !== undefined
          ? this.toNumber(updateData.tahun)
          : existingProgram.tahun,

      tanggal_mulai:
        updateData.tanggal_mulai !== undefined
          ? updateData.tanggal_mulai
            ? new Date(updateData.tanggal_mulai)
            : null
          : existingProgram.tanggal_mulai,

      tanggal_selesai:
        updateData.tanggal_selesai !== undefined
          ? updateData.tanggal_selesai
            ? new Date(updateData.tanggal_selesai)
            : null
          : existingProgram.tanggal_selesai,

      status_program:
        updateData.status_program !== undefined
          ? updateData.status_program
          : existingProgram.status_program,

      id_sekolah: idSekolah,
      sekolah_ids: finalSekolahIds,

      id_pengawas: idPengawas,
      ao_ids: finalAoIds,

      id_vendor: finalVendorIds,
      vendor_ids: finalVendorIds,

      kpi_nama:
        updateData.kpi_nama !== undefined
          ? updateData.kpi_nama || null
          : existingProgram.kpi_nama,

      kpi_target:
        updateData.kpi_target !== undefined
          ? this.toNumber(updateData.kpi_target, 0)
          : existingProgram.kpi_target,

      kpi_satuan:
        updateData.kpi_satuan !== undefined
          ? updateData.kpi_satuan || null
          : existingProgram.kpi_satuan,

      updated_at: new Date(),
    };

    if (file) {
      const driveStatus = await this.googleDriveService.getStatus(id_user);

      if (!driveStatus?.connected) {
        throw new BadRequestException({
          code: 'GOOGLE_DRIVE_NOT_CONNECTED',
          message:
            'Akun Anda belum tertaut ke Google Drive. Hubungkan Google Drive terlebih dahulu untuk mengunggah MOU.',
        });
      }

      const uploadedMou = await this.googleDriveService.uploadFile({
        idUser: id_user,
        idRole: id_role ?? null,
        file,
        moduleType: 'PROGRAM_MOU_EDIT',
        relatedTable: 't_program',
        relatedId: id,
      });

      const driveFile = uploadedMou.file;

      dataToSave.file_mou =
        driveFile?.web_view_link ||
        driveFile?.drive_file_id ||
        file.originalname;

      const dokumen = this.dokumenProgramRepo.create({
        id_program: id,
        jenis_dokumen: 'MOU_EDIT',
        nama_file: file.originalname,
        file_path:
          driveFile?.web_view_link ||
          driveFile?.web_content_link ||
          driveFile?.drive_file_id ||
          file.originalname,
        upload_by: id_user,
      });

      await this.dokumenProgramRepo.save(dokumen);
    }

    await this.programRepo.update(id, dataToSave);

    return this.findOne(id);
  }

  remove(id: number) {
    return this.programRepo.delete(id);
  }
}
