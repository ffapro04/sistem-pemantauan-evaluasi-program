/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';

import { Assessment } from './entities/assessment.entity';
import { AssessmentPertanyaan } from './entities/assessment-pertanyaan.entity';
import { AssessmentJawaban } from './entities/assessment-jawaban.entity';
import { Sekolah } from '../sekolah/entities/sekolah.entity';
import { User } from '../users/user.entity';
import { AssessmentGuru } from '../assessment-guru/entities/assessment-guru.entity';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { NotificationRecipientType } from '../notifikasi/entities/notifikasi.entity';
import { parsePagination, toPaginatedResult } from '../common/pagination.util';

function normalizeAssessmentPilar(value?: string, jenis?: string) {
  const raw = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_');

  if (raw.includes('KARAKTER')) return 'KARAKTER';
  if (raw.includes('SENI')) return 'SENI_BUDAYA';
  if (raw.includes('KECAKAPAN') || raw.includes('HIDUP'))
    return 'KECAKAPAN_HIDUP';
  if (raw.includes('AKADEMIK')) return 'AKADEMIK';

  const jenisRaw = String(jenis || '').toLowerCase();
  return jenisRaw.includes('non') ? 'SENI_BUDAYA' : 'AKADEMIK';
}

function normalizeAssessmentJenisKey(value?: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '_');
}

type AssessmentTiming = Pick<
  Assessment,
  'sent_at' | 'tenggat' | 'aktif' | 'paused_at' | 'total_paused_seconds'
>;

const SECOND_MS = 1000;
const DAY_MS = 24 * 60 * 60 * SECOND_MS;

function getAssessmentBaseDeadline(assessment: AssessmentTiming) {
  if (!assessment.sent_at) return null;

  const sentAt = new Date(assessment.sent_at);
  if (Number.isNaN(sentAt.getTime())) return null;

  const durationMs = Number(assessment.tenggat ?? 7) * DAY_MS;
  const pausedMs =
    Math.max(0, Number(assessment.total_paused_seconds || 0)) * SECOND_MS;

  return new Date(sentAt.getTime() + durationMs + pausedMs);
}

function getAssessmentReferenceTime(
  assessment: AssessmentTiming,
  nowMs = Date.now(),
) {
  if (assessment.aktif === false && assessment.paused_at) {
    const pausedAt = new Date(assessment.paused_at).getTime();
    if (!Number.isNaN(pausedAt)) return pausedAt;
  }

  return nowMs;
}

function getAssessmentRemainingSeconds(
  assessment: AssessmentTiming,
  nowMs = Date.now(),
) {
  const baseDeadline = getAssessmentBaseDeadline(assessment);
  if (!baseDeadline) return null;

  const referenceMs = getAssessmentReferenceTime(assessment, nowMs);
  return Math.max(
    0,
    Math.ceil((baseDeadline.getTime() - referenceMs) / SECOND_MS),
  );
}

function getAssessmentDeadline(
  assessment: AssessmentTiming,
  nowMs = Date.now(),
) {
  const baseDeadline = getAssessmentBaseDeadline(assessment);
  if (!baseDeadline) return null;

  if (assessment.aktif === false && assessment.paused_at) {
    const pausedAt = new Date(assessment.paused_at).getTime();
    if (!Number.isNaN(pausedAt)) {
      return new Date(baseDeadline.getTime() + Math.max(0, nowMs - pausedAt));
    }
  }

  return baseDeadline;
}

function getAssessmentRemainingDays(assessment: AssessmentTiming) {
  const remainingSeconds = getAssessmentRemainingSeconds(assessment);
  if (remainingSeconds === null) return null;

  return Math.max(0, Math.ceil(remainingSeconds / (24 * 60 * 60)));
}

function isAssessmentExpired(assessment: AssessmentTiming) {
  const remainingSeconds = getAssessmentRemainingSeconds(assessment);
  return remainingSeconds !== null && remainingSeconds <= 0;
}

@Injectable()
export class AssessmentService {
  private readonly logger = new Logger(AssessmentService.name);

  constructor(
    @InjectRepository(Assessment)
    private assessmentRepo: Repository<Assessment>,

    @InjectRepository(AssessmentPertanyaan)
    private pertanyaanRepo: Repository<AssessmentPertanyaan>,

    @InjectRepository(AssessmentJawaban)
    private jawabanRepo: Repository<AssessmentJawaban>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Sekolah)
    private sekolahRepo: Repository<Sekolah>,

    @InjectRepository(AssessmentGuru)
    private guruRepo: Repository<AssessmentGuru>,

    private readonly notifikasiService: NotifikasiService,
  ) {}

  private toNumberArray(value: any): number[] {
    if (Array.isArray(value)) {
      return value.map(Number).filter((item) => Number.isFinite(item));
    }

    if (typeof value === 'string' && value.trim() !== '') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map(Number).filter((item) => Number.isFinite(item));
        }
      } catch {
        return value
          .split(',')
          .map((item) => Number(item.trim()))
          .filter((item) => Number.isFinite(item));
      }
    }

    if (typeof value === 'number') return [value];

    return [];
  }

  private formatDateOnly(value?: Date | string | null) {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private getAssessmentTargetUrl(assessment: Assessment) {
    return `/sekolah/assessment/isi/${assessment.id_assessment}`;
  }

  private async getAssessmentNotificationAudience(assessment: Assessment) {
    const targetSekolahIds = this.toNumberArray(assessment.target_sekolah_ids)
      .map(Number)
      .filter((id) => Number.isFinite(id) && id > 0);

    if (!targetSekolahIds.length) {
      return {
        schoolUserIds: [],
        guruIds: [],
      };
    }

    const [schoolUsers, gurus] = await Promise.all([
      this.assessmentRepo.manager.query(
        `
          SELECT id_user
          FROM m_users
          WHERE id_sekolah = ANY($1::int[])
            AND COALESCE(status, true) = true
            AND (
              id_role IN (5, 9, 10)
              OR LOWER(COALESCE(jabatan, '')) LIKE '%operator%'
              OR LOWER(COALESCE(jabatan, '')) LIKE '%kepala%'
            )
        `,
        [targetSekolahIds],
      ),
      this.assessmentRepo.manager.query(
        `
          SELECT id_guru_assessment
          FROM assessment_guru
          WHERE id_sekolah = ANY($1::int[])
            AND COALESCE(is_active, true) = true
        `,
        [targetSekolahIds],
      ),
    ]);

    return {
      schoolUserIds: Array.from(
        new Set(
          schoolUsers
            .map((row: any) => Number(row.id_user || 0))
            .filter(Boolean),
        ),
      ),
      guruIds: Array.from(
        new Set(
          gurus
            .map((row: any) => Number(row.id_guru_assessment || 0))
            .filter(Boolean),
        ),
      ),
    };
  }

  private async notifyAssessmentSent(assessment: Assessment) {
    if (!assessment?.id_assessment) return;

    const audience = await this.getAssessmentNotificationAudience(assessment);
    const targetUrl = this.getAssessmentTargetUrl(assessment);
    const listUrl = '/sekolah/assessment';
    const startDate = this.formatDateOnly(assessment.sent_at);
    const endDate = this.formatDateOnly(getAssessmentDeadline(assessment));
    const assessmentName = assessment.nama || 'Assessment';

    const rows: any[] = [
      ...audience.guruIds.map((idGuru) => ({
        recipientType: NotificationRecipientType.GURU_ASSESSMENT,
        recipientId: idGuru,
        judul: 'Assessment baru perlu diisi',
        pesan: `Assessment "${assessmentName}" sudah dibuka. Periode pengisian ${startDate} sampai ${endDate}. Silakan isi melalui link sistem.`,
        tipe: 'ASSESSMENT_SENT',
        targetUrl,
        metadata: {
          id_assessment: assessment.id_assessment,
          deadline: endDate,
        },
        dedupeKey: `assessment-sent:guru:${assessment.id_assessment}:${idGuru}`,
      })),
      ...audience.schoolUserIds.map((idUser) => ({
        recipientType: NotificationRecipientType.USER,
        recipientId: idUser,
        legacyUserId: idUser,
        judul: 'Assessment baru untuk sekolah',
        pesan: `Assessment "${assessmentName}" sudah dikirim ke sekolah Anda. Periode pengisian ${startDate} sampai ${endDate}. Pantau dan pastikan data terisi tepat waktu.`,
        tipe: 'ASSESSMENT_SENT',
        targetUrl: listUrl,
        metadata: {
          id_assessment: assessment.id_assessment,
          deadline: endDate,
        },
        dedupeKey: `assessment-sent:school:${assessment.id_assessment}:${idUser}`,
      })),
    ];

    await this.notifikasiService.dispatchMany(rows);
  }

  private async hydrateAssessmentPersonas<T extends any>(payload: T | T[]) {
    const isArrayPayload = Array.isArray(payload);
    const assessments = (isArrayPayload ? payload : [payload]).filter(
      Boolean,
    ) as any[];

    if (assessments.length === 0) return payload;

    const uniqueNumbers = (values: any[]) =>
      Array.from(
        new Set(
          values
            .flatMap((value) => this.toNumberArray(value))
            .map(Number)
            .filter((value) => Number.isFinite(value) && value > 0),
        ),
      );

    const hoIds = uniqueNumbers(
      assessments.flatMap((assessment) => [
        assessment?.id_ho,
        assessment?.ho_id,
        assessment?.created_by,
        assessment?.created_by_user_id,
      ]),
    );

    const sekolahIds = uniqueNumbers(
      assessments.flatMap((assessment) => [
        assessment?.target_sekolah_ids,
        assessment?.sekolah_ids,
        assessment?.id_sekolah,
        assessment?.sekolah_id,
      ]),
    );

    const [hoRows, sekolahRows] = await Promise.all([
      hoIds.length
        ? this.userRepo
            .createQueryBuilder('user')
            .select([
              'user.id_user AS id_user',
              'user.nama AS nama',
              'user.email AS email',
              'user.jabatan AS jabatan',
              'user.id_role AS id_role',
            ])
            .where('user.id_user IN (:...ids)', { ids: hoIds })
            .getRawMany()
        : Promise.resolve([]),

      sekolahIds.length
        ? this.sekolahRepo
            .createQueryBuilder('sekolah')
            .select([
              'sekolah.id_sekolah AS id_sekolah',
              'sekolah.nama_sekolah AS nama_sekolah',
              'sekolah.npsn AS npsn',
              'sekolah.jenjang AS jenjang',
              'sekolah.id_wilayah AS id_wilayah',
            ])
            .where('sekolah.id_sekolah IN (:...ids)', { ids: sekolahIds })
            .getRawMany()
        : Promise.resolve([]),
    ]);

    const hoMap = new Map(hoRows.map((row: any) => [Number(row.id_user), row]));
    const sekolahMap = new Map(
      sekolahRows.map((row: any) => [Number(row.id_sekolah), row]),
    );

    assessments.forEach((assessment) => {
      const assessmentHoIds = uniqueNumbers([
        assessment?.id_ho,
        assessment?.ho_id,
        assessment?.created_by,
        assessment?.created_by_user_id,
      ]);

      const targetSekolahIds = uniqueNumbers([
        assessment?.target_sekolah_ids,
        assessment?.sekolah_ids,
        assessment?.id_sekolah,
        assessment?.sekolah_id,
      ]);

      const ho =
        assessmentHoIds.map((id) => hoMap.get(id)).find(Boolean) || null;
      const targetSekolahs = targetSekolahIds
        .map((id) => sekolahMap.get(id))
        .filter(Boolean);

      assessment.ho = assessment.ho || ho?.nama || null;
      assessment.ho_user = ho;
      assessment.user = ho;
      assessment.creator = ho;
      assessment.created_by_user = ho;
      assessment.pembuat = ho;

      assessment.target_sekolahs = targetSekolahs;
      assessment.targetSekolahs = targetSekolahs;
      assessment.sekolahs = targetSekolahs;
      assessment.schools = targetSekolahs;
    });

    return isArrayPayload ? assessments : assessments[0];
  }

  async create(dto: CreateAssessmentDto) {
    const idHo = Number(dto?.id_ho);
    const nama = String(dto?.nama || '').trim();
    const targetSekolahIds = Array.isArray(dto?.target_sekolah_ids)
      ? dto.target_sekolah_ids
          .map(Number)
          .filter((id) => Number.isFinite(id) && id > 0)
      : [];
    const questions = Array.isArray(dto?.questions) ? dto.questions : [];

    if (!idHo) {
      throw new BadRequestException('ID HO tidak valid.');
    }

    if (!nama) {
      throw new BadRequestException('Nama assessment wajib diisi.');
    }

    if (targetSekolahIds.length === 0) {
      throw new BadRequestException('Pilih minimal satu sekolah target.');
    }

    if (questions.length === 0) {
      throw new BadRequestException('Minimal satu pertanyaan wajib diisi.');
    }

    questions.forEach((question, index) => {
      const text = String(question?.question || '').trim();
      const options = Array.isArray(question?.options)
        ? question.options
            .map((option) => String(option || '').trim())
            .filter(Boolean)
        : [];

      if (!text) {
        throw new BadRequestException(
          `Pertanyaan nomor ${index + 1} wajib diisi.`,
        );
      }

      if (options.length < 2) {
        throw new BadRequestException(
          `Pertanyaan nomor ${index + 1} wajib memiliki minimal 2 pilihan.`,
        );
      }
    });

    const assessment = await this.assessmentRepo.manager.transaction(
      async (manager) => {
        const savedAssessment = await manager.save(
          Assessment,
          this.assessmentRepo.create({
            id_ho: idHo,
            nama,
            target_sekolah_ids: targetSekolahIds,
            tenggat: Number(dto?.tenggat) || 7,
            jenis: dto?.jenis ?? 'non-akademik',
            pilar: normalizeAssessmentPilar(dto?.pilar, dto?.jenis),
            status: 'Siap Diajukan',
            aktif: true,
            sent_at: null,
            paused_at: null,
            total_paused_seconds: 0,
          }),
        );

        for (let i = 0; i < questions.length; i++) {
          const options = questions[i].options
            .map((option) => String(option || '').trim())
            .filter(Boolean);

          await manager.save(
            AssessmentPertanyaan,
            this.pertanyaanRepo.create({
              id_assessment: savedAssessment.id_assessment,
              pertanyaan: String(questions[i].question || '').trim(),
              options,
              urutan: i + 1,
            }),
          );
        }

        return savedAssessment;
      },
    );

    return {
      message: 'Assessment berhasil dibuat',
      id_assessment: assessment.id_assessment,
    };
  }

  async findAll(
    jenis?: string,
    id_ho?: number,
    pilar?: string,
    currentUser?: any,
    page?: string,
    limit?: string,
  ) {
    const roleId = Number(
      currentUser?.id_role ??
        currentUser?.role?.id_role ??
        currentUser?.role_id ??
        0,
    );

    const subJenis = String(
      currentUser?.sub_jenis ?? currentUser?.subJenis ?? '',
    )
      .trim()
      .toUpperCase();

    const currentUserJenis = normalizeAssessmentJenisKey(
      currentUser?.jenis ?? currentUser?.kategori ?? '',
    );

    const requestedJenis = normalizeAssessmentJenisKey(jenis);
    const currentHoJenisScope =
      roleId === 3 && currentUserJenis.includes('non')
        ? 'non_akademik'
        : roleId === 3 && currentUserJenis.includes('akademik')
          ? 'akademik'
          : '';

    const query = this.assessmentRepo
      .createQueryBuilder('a')
      .leftJoin('m_users', 'u', 'u.id_user = a.id_ho')
      .select([
        'a.id_assessment AS id_assessment',
        'a.id_ho AS id_ho',
        'a.dibuat_oleh AS dibuat_oleh',
        'a.nama AS nama',
        'a.status AS status',
        'a.aktif AS aktif',
        'a.sent_at AS sent_at',
        'a.paused_at AS paused_at',
        'a.total_paused_seconds AS total_paused_seconds',
        'a.created_at AS created_at',
        'a.updated_at AS updated_at',
        'a.tenggat AS tenggat',
        'a.jenis AS jenis',
        'a.pilar AS pilar',
        'a.target_sekolah_ids AS target_sekolah_ids',
        'u.nama AS ho',
      ])
      .addSelect(
        `COALESCE((
          SELECT STRING_AGG(DISTINCT s.nama_sekolah, ', ')
          FROM public.m_sekolah s
          WHERE s.id_sekolah = ANY(a.target_sekolah_ids)
        ), '')`,
        'daftar_sekolah',
      )
      .addSelect(
        `COALESCE((
          SELECT COUNT(DISTINCT COALESCE(
            aj.id_guru_assessment::text,
            aj.id_user::text || aj.nama_pengisi
          ))
          FROM public.t_assessment_pertanyaan ap
          JOIN public.assessment_jawaban aj
            ON aj.id_pertanyaan = ap.id_pertanyaan
          WHERE ap.id_assessment = a.id_assessment
        ), 0)`,
        'jumlah_pengisi',
      )
      .addSelect(
        `COALESCE((
          SELECT COUNT(DISTINCT ag.id_guru_assessment)
          FROM public.assessment_guru ag
          WHERE ag.id_sekolah = ANY(a.target_sekolah_ids)
            AND ag.is_active = true
        ), 0)`,
        'jumlah_guru_target',
      );

    if (requestedJenis) {
      query.andWhere(
        `REPLACE(REPLACE(LOWER(TRIM(COALESCE(a.jenis, ''))), '-', '_'), ' ', '_') = :jenis`,
        { jenis: requestedJenis },
      );
    }

    if (roleId === 3) {
      if (
        requestedJenis &&
        currentHoJenisScope &&
        requestedJenis !== currentHoJenisScope
      ) {
        query.andWhere('1 = 0');
      } else if (!requestedJenis && currentHoJenisScope) {
        query.andWhere(
          `REPLACE(REPLACE(LOWER(TRIM(COALESCE(a.jenis, ''))), '-', '_'), ' ', '_') = :jenisScope`,
          { jenisScope: currentHoJenisScope },
        );
      }

      if (subJenis.includes('SMK')) {
        query.andWhere(`
          NOT EXISTS (
            SELECT 1
            FROM public.m_sekolah sx
            WHERE sx.id_sekolah = ANY(a.target_sekolah_ids)
              AND UPPER(TRIM(COALESCE(sx.jenjang, ''))) <> 'SMK'
          )
        `);
      } else if (subJenis.includes('SD') || subJenis.includes('SMP')) {
        query.andWhere(`
          NOT EXISTS (
            SELECT 1
            FROM public.m_sekolah sx
            WHERE sx.id_sekolah = ANY(a.target_sekolah_ids)
              AND UPPER(TRIM(COALESCE(sx.jenjang, ''))) = 'SMK'
          )
        `);
      }
    } else if (id_ho) {
      query.andWhere('(a.id_ho = :id_ho OR a.dibuat_oleh = :id_ho)', { id_ho });
    }

    if (pilar && pilar !== 'SEMUA') {
      query.andWhere('a.pilar = :pilar', {
        pilar: normalizeAssessmentPilar(pilar, jenis),
      });
    }

    const pagination = parsePagination(page, limit);
    const total = pagination ? await query.getCount() : undefined;

    if (pagination) {
      query.offset((pagination.page - 1) * pagination.limit);
      query.limit(pagination.limit);
    }

    const rows = await query.getRawMany();

    const mappedRows = rows.map((row) => {
      const jumlahPengisi = Number(row.jumlah_pengisi || 0);
      const jumlahGuruTarget = Number(row.jumlah_guru_target || 0);

      const timing = row as AssessmentTiming;
      const remainingSeconds = getAssessmentRemainingSeconds(timing);

      return {
        ...row,
        total_paused_seconds: Number(row.total_paused_seconds || 0),
        remaining_seconds: remainingSeconds,
        deadline: getAssessmentDeadline(timing),
        is_paused: Boolean(row.sent_at && row.aktif === false),
        jumlah_pengisi: jumlahPengisi,
        jumlah_guru_target: jumlahGuruTarget,
        belum_mengisi: Math.max(jumlahGuruTarget - jumlahPengisi, 0),
        persentase_pengisian:
          jumlahGuruTarget > 0
            ? Math.round((jumlahPengisi / jumlahGuruTarget) * 100)
            : 0,
      };
    });

    const hydrated = await this.hydrateAssessmentPersonas(mappedRows);

    if (pagination) {
      return toPaginatedResult(hydrated as any[], total as number, pagination);
    }

    return hydrated;
  }

  async findOne(id: number) {
    const assessment = await this.assessmentRepo.findOne({
      where: { id_assessment: id },
    });

    if (!assessment) {
      throw new Error('Assessment tidak ditemukan');
    }

    const pertanyaan = await this.pertanyaanRepo.find({
      where: { id_assessment: id },
      order: { urutan: 'ASC' },
    });

    const tanggalSelesai = getAssessmentDeadline(assessment);
    const remainingSeconds = getAssessmentRemainingSeconds(assessment);

    const result = {
      id_assessment: assessment.id_assessment,
      id_ho: assessment.id_ho,
      nama: assessment.nama,
      status: assessment.status,
      aktif: assessment.aktif,
      sent_at: assessment.sent_at,
      paused_at: assessment.paused_at,
      total_paused_seconds: assessment.total_paused_seconds || 0,
      remaining_seconds: remainingSeconds,
      is_paused: Boolean(assessment.sent_at && !assessment.aktif),
      tenggat: assessment.tenggat,
      jenis: assessment.jenis,
      pilar:
        assessment.pilar ||
        normalizeAssessmentPilar(undefined, assessment.jenis),
      target_sekolah_ids: assessment.target_sekolah_ids || [],
      tanggal_selesai: tanggalSelesai,
      questions: pertanyaan.map((p) => ({
        id_pertanyaan: p.id_pertanyaan,
        question: p.pertanyaan,
        options: Array.isArray(p.options) ? p.options : [],
      })),
    };

    return this.hydrateAssessmentPersonas(result);
  }

  async getHasilAssessment(id: number) {
    const assessment = await this.assessmentRepo.findOne({
      where: { id_assessment: id },
    });

    if (!assessment) {
      throw new Error('Assessment tidak ditemukan');
    }

    const pertanyaan = await this.pertanyaanRepo.find({
      where: { id_assessment: id },
      order: { urutan: 'ASC' },
    });

    const targetSekolahIds = assessment.target_sekolah_ids || [];

    const sekolahRows =
      targetSekolahIds.length > 0
        ? await this.sekolahRepo
            .createQueryBuilder('s')
            .leftJoin('m_wilayah', 'w', 'w.id_wilayah = s.id_wilayah')
            .where('s.id_sekolah IN (:...ids)', { ids: targetSekolahIds })
            .select([
              's.id_sekolah AS id_sekolah',
              's.nama_sekolah AS nama_sekolah',
              's.akreditasi AS akreditasi',
              's.jumlah_guru AS jumlah_guru',
              's.npsn AS npsn',
              'w.nama_wilayah AS nama_wilayah',
            ])
            .getRawMany()
        : [];

    const sekolahProfile = sekolahRows.map((s) => ({
      id: Number(s.id_sekolah),
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        s.nama_sekolah || 'Sekolah',
      )}&background=0AC4E0&color=fff`,
      nama: s.nama_sekolah || '-',
      npsn: s.npsn || '-',
      wilayah: s.nama_wilayah || '-',
      akreditasi: s.akreditasi || '-',
    }));

    const semuaJawaban = await this.jawabanRepo
      .createQueryBuilder('aj')
      .innerJoin(
        't_assessment_pertanyaan',
        'ap',
        'ap.id_pertanyaan = aj.id_pertanyaan',
      )
      .leftJoin(
        'assessment_guru',
        'ag',
        'ag.id_guru_assessment = aj.id_guru_assessment',
      )
      .leftJoin('m_sekolah', 'sg', 'sg.id_sekolah = ag.id_sekolah')
      .leftJoin('m_users', 'u', 'u.id_user = aj.id_user')
      .leftJoin('m_sekolah', 's', 's.id_sekolah = u.id_sekolah')
      .where('ap.id_assessment = :id', { id })
      .select([
        'aj.id_jawaban AS id_jawaban',
        'aj.id_user AS id_user',
        'aj.id_guru_assessment AS id_guru_assessment',
        'aj.id_pertanyaan AS id_pertanyaan',
        'aj.nama_pengisi AS nama_pengisi',
        'aj.nama_guru_snapshot AS nama_guru_snapshot',
        'aj.jawaban AS jawaban',
        'aj.skor AS skor',
        'aj.created_at AS created_at',
        'COALESCE(sg.nama_sekolah, s.nama_sekolah) AS nama_sekolah',
      ])
      .orderBy('aj.created_at', 'ASC')
      .getRawMany();

    const uniquePengisi = [
      ...new Map(
        semuaJawaban
          .filter((j) => j.nama_guru_snapshot || j.nama_pengisi)
          .map((j) => [
            j.id_guru_assessment
              ? `guru-${j.id_guru_assessment}`
              : `${j.id_user}-${j.nama_pengisi}`,
            {
              id_user: j.id_user,
              id_guru_assessment: j.id_guru_assessment,
              nama_pengisi: j.nama_guru_snapshot || j.nama_pengisi,
              nama_sekolah: j.nama_sekolah,
              created_at: j.created_at,
            },
          ]),
      ).values(),
    ];

    const pengisi = uniquePengisi.map((p, index) => {
      const jawabanPengisi = semuaJawaban.filter((j) => {
        if (p.id_guru_assessment) {
          return Number(j.id_guru_assessment) === Number(p.id_guru_assessment);
        }

        return j.id_user === p.id_user && j.nama_pengisi === p.nama_pengisi;
      });

      return {
        id_pengisi: index + 1,
        id_user: p.id_user,
        id_guru_assessment: p.id_guru_assessment,
        nama: p.nama_pengisi,
        sekolah:
          p.nama_sekolah ||
          sekolahRows.map((s) => s.nama_sekolah).join(', ') ||
          '-',
        tanggal_mengisi: p.created_at || new Date(),
        jawaban: jawabanPengisi.map((j) => ({
          id_pertanyaan: Number(j.id_pertanyaan),
          jawaban: j.jawaban,
          skor: j.skor ?? 0,
          komentar: null,
        })),
      };
    });

    const sudahMengisi = pengisi.length;

    const totalRespondenByGuru = sekolahRows.reduce(
      (total, sekolah) => total + Number(sekolah.jumlah_guru || 0),
      0,
    );

    const totalResponden = Math.max(
      totalRespondenByGuru,
      targetSekolahIds.length,
      sudahMengisi,
    );

    const belumMengisi = Math.max(totalResponden - sudahMengisi, 0);

    const deadline = getAssessmentDeadline(assessment);
    const remainingSeconds = getAssessmentRemainingSeconds(assessment);

    return {
      id_assessment: assessment.id_assessment,
      nama_assessment: assessment.nama,
      jenis: assessment.jenis,
      sent_at: assessment.sent_at || null,
      paused_at: assessment.paused_at || null,
      total_paused_seconds: assessment.total_paused_seconds || 0,
      remaining_seconds: remainingSeconds,
      is_paused: Boolean(assessment.sent_at && !assessment.aktif),
      tenggat: assessment.tenggat || 7,
      deadline,

      total_responden: totalResponden,
      sudah_mengisi: sudahMengisi,
      belum_mengisi: belumMengisi,

      sekolah_profile: sekolahProfile,

      pertanyaan: pertanyaan.map((p, index) => ({
        id_pertanyaan: p.id_pertanyaan,
        nomor: index + 1,
        teks: p.pertanyaan,
        pilihan: Array.isArray(p.options) ? p.options : [],
      })),

      pengisi,
    };
  }

  async exportHasilAssessmentCsv(id: number) {
    const hasil = await this.getHasilAssessment(id);
    const headers = [
      'Assessment',
      'Jenis',
      'Nama Pengisi',
      'Sekolah',
      'Tanggal Mengisi',
      'Pertanyaan',
      'Jawaban',
      'Skor',
    ];

    const escapeCsv = (value: any) => {
      const text = String(value ?? '').replace(/"/g, '""');
      return `"${text}"`;
    };

    const rows = [];

    for (const pengisi of hasil.pengisi || []) {
      for (const jawaban of pengisi.jawaban || []) {
        const pertanyaan = (hasil.pertanyaan || []).find(
          (item) =>
            Number(item.id_pertanyaan) === Number(jawaban.id_pertanyaan),
        );

        rows.push([
          hasil.nama_assessment,
          hasil.jenis,
          pengisi.nama,
          pengisi.sekolah,
          pengisi.tanggal_mengisi,
          pertanyaan?.teks || '',
          jawaban.jawaban,
          jawaban.skor,
        ]);
      }
    }

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n');

    const safeAssessmentName =
      String(hasil.nama_assessment || `assessment-${id}`)
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase()
        .slice(0, 120) || `assessment-${id}`;

    return {
      filename: `${safeAssessmentName}.csv`,
      content: `\uFEFF${csv}`,
    };
  }

  async importHasilAssessment(id: number, body: any) {
    const assessment = await this.assessmentRepo.findOne({
      where: { id_assessment: id },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment tidak ditemukan');
    }

    if (!assessment.sent_at) {
      throw new BadRequestException(
        'Assessment belum dikirim dan belum dapat menerima hasil.',
      );
    }

    if (!assessment.aktif) {
      throw new BadRequestException(
        'Assessment sedang pending. Lanjutkan assessment sebelum import hasil.',
      );
    }

    if (isAssessmentExpired(assessment)) {
      throw new BadRequestException(
        'Tenggat assessment sudah selesai. Jawaban tidak bisa dikirim lagi.',
      );
    }

    const rows = Array.isArray(body?.rows) ? body.rows : [];
    if (rows.length === 0) {
      throw new BadRequestException('Data import kosong.');
    }

    const pertanyaan = await this.pertanyaanRepo.find({
      where: { id_assessment: id },
      order: { urutan: 'ASC' },
    });

    if (pertanyaan.length === 0) {
      throw new BadRequestException('Assessment belum memiliki pertanyaan.');
    }

    const questionMap = new Map<string, AssessmentPertanyaan>();
    pertanyaan.forEach((item, index) => {
      questionMap.set(String(item.id_pertanyaan), item);
      questionMap.set(`q${index + 1}`, item);
      questionMap.set(`soal${index + 1}`, item);
      questionMap.set(
        String(item.pertanyaan || '')
          .trim()
          .toLowerCase(),
        item,
      );
    });

    const targetSekolahIds = assessment.target_sekolah_ids || [];
    const guruRows =
      targetSekolahIds.length > 0
        ? await this.guruRepo
            .createQueryBuilder('guru')
            .where('guru.id_sekolah IN (:...ids)', { ids: targetSekolahIds })
            .getMany()
        : [];

    const normalize = (value: any) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');

    const getGuru = (row: any) => {
      const idGuru = Number(row.id_guru_assessment || row.id_guru || 0);
      if (idGuru) {
        return guruRows.find(
          (guru) => Number(guru.id_guru_assessment) === Number(idGuru),
        );
      }

      const nama = normalize(row.nama_pengisi || row.nama_guru || row.nama);
      if (!nama) return null;

      return (
        guruRows.find((guru) => normalize(guru.nama_guru) === nama) || null
      );
    };

    const answerRows: any[] = [];

    for (const row of rows) {
      const guru = getGuru(row);
      const namaPengisi =
        row.nama_pengisi ||
        row.nama_guru ||
        row.nama ||
        guru?.nama_guru ||
        'Pengisi Import';
      const idGuru = guru?.id_guru_assessment || row.id_guru_assessment || null;

      const answers = Array.isArray(row.answers) ? row.answers : [];

      for (const answer of answers) {
        const key = normalize(
          answer.id_pertanyaan ||
            answer.pertanyaan ||
            answer.question ||
            answer.key ||
            '',
        );
        const question =
          questionMap.get(String(answer.id_pertanyaan || '')) ||
          questionMap.get(key);

        if (!question || !String(answer.jawaban || '').trim()) continue;

        answerRows.push({
          id_pertanyaan: question.id_pertanyaan,
          id_user: row.id_user || null,
          id_guru_assessment: idGuru,
          nama_pengisi: String(namaPengisi).trim(),
          nama_guru_snapshot: String(namaPengisi).trim(),
          jawaban: String(answer.jawaban).trim(),
          skor: Number(answer.skor || 0),
        });
      }
    }

    if (answerRows.length === 0) {
      throw new BadRequestException(
        'Tidak ada jawaban valid yang bisa diimport.',
      );
    }

    const questionIds = pertanyaan.map((item) => item.id_pertanyaan);
    const guruIds = [
      ...new Set(
        answerRows
          .map((row) => Number(row.id_guru_assessment || 0))
          .filter(Boolean),
      ),
    ];
    const importedNames = [
      ...new Set(answerRows.map((row) => row.nama_pengisi).filter(Boolean)),
    ];

    const deleteQuery = this.jawabanRepo
      .createQueryBuilder()
      .delete()
      .from('assessment_jawaban')
      .where('id_pertanyaan IN (:...questionIds)', { questionIds });

    if (guruIds.length > 0) {
      deleteQuery.andWhere('id_guru_assessment IN (:...guruIds)', { guruIds });
    } else {
      deleteQuery.andWhere('nama_pengisi IN (:...importedNames)', {
        importedNames,
      });
    }

    await deleteQuery.execute();
    await this.jawabanRepo.save(answerRows);

    return {
      message: 'Hasil assessment berhasil diimport.',
      imported_rows: rows.length,
      imported_answers: answerRows.length,
    };
  }

  async getBestRenggo(jenis?: string, id_assessment?: number) {
    const normalizeJenis = (value?: string) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/-/g, '_')
        .replace(/\s+/g, '_');

    const query = this.jawabanRepo
      .createQueryBuilder('aj')
      .innerJoin(
        't_assessment_pertanyaan',
        'ap',
        'ap.id_pertanyaan = aj.id_pertanyaan',
      )
      .innerJoin('t_assessment', 'a', 'a.id_assessment = ap.id_assessment')
      .leftJoin(
        'assessment_guru',
        'ag',
        'ag.id_guru_assessment = aj.id_guru_assessment',
      )
      .leftJoin('m_sekolah', 's', 's.id_sekolah = ag.id_sekolah')
      .where('aj.id_guru_assessment IS NOT NULL')
      .select([
        'ag.id_guru_assessment AS id_guru_assessment',
        'ag.id_sekolah AS id_sekolah',
        'COALESCE(aj.nama_guru_snapshot, ag.nama_guru, aj.nama_pengisi) AS nama_guru',
        's.nama_sekolah AS nama_sekolah',
        'a.id_assessment AS id_assessment',
        'a.nama AS nama_assessment',
        'a.jenis AS jenis',
        'a.pilar AS pilar',
        'COUNT(DISTINCT a.id_assessment) AS total',
      ])
      .groupBy(
        `
        ag.id_guru_assessment,
        ag.id_sekolah,
        COALESCE(aj.nama_guru_snapshot, ag.nama_guru, aj.nama_pengisi),
        s.nama_sekolah,
        a.id_assessment,
        a.nama,
        a.jenis,
        a.pilar
        `,
      )
      .orderBy('COUNT(DISTINCT a.id_assessment)', 'DESC');

    if (jenis) {
      query.andWhere(
        `REPLACE(REPLACE(LOWER(a.jenis), '-', '_'), ' ', '_') = :jenis`,
        { jenis: normalizeJenis(jenis) },
      );
    }

    if (id_assessment) {
      query.andWhere('a.id_assessment = :id_assessment', { id_assessment });
    }

    const rows = await query.getRawMany();

    return rows.map((row) => ({
      id: `${row.id_guru_assessment}-${row.id_assessment}`,
      id_guru_assessment: Number(row.id_guru_assessment),
      id_sekolah: Number(row.id_sekolah),
      teacherName: row.nama_guru || 'Guru belum terbaca',
      schoolName: row.nama_sekolah || '-',
      assessmentId: Number(row.id_assessment),
      assessmentTitle: row.nama_assessment || 'Assessment',
      jenis: row.jenis,
      pilar: row.pilar,
      total: Number(row.total || 1),
    }));
  }

  async update(id: number, body: any) {
    const assessment = await this.assessmentRepo.findOne({
      where: { id_assessment: id },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment tidak ditemukan');
    }

    if (body.nama !== undefined) assessment.nama = body.nama;
    if (body.tenggat !== undefined) assessment.tenggat = body.tenggat;
    if (body.jenis !== undefined) assessment.jenis = body.jenis;
    if (body.pilar !== undefined) {
      assessment.pilar = normalizeAssessmentPilar(
        body.pilar,
        body.jenis || assessment.jenis,
      );
    }
    if (body.target_sekolah_ids !== undefined) {
      assessment.target_sekolah_ids = body.target_sekolah_ids;
    }

    await this.assessmentRepo.save(assessment);

    if (body.questions !== undefined) {
      await this.pertanyaanRepo.delete({ id_assessment: id });

      const questions = Array.isArray(body.questions) ? body.questions : [];

      for (let i = 0; i < questions.length; i++) {
        await this.pertanyaanRepo.save({
          id_assessment: id,
          pertanyaan: questions[i].question,
          options: questions[i].options,
          urutan: i + 1,
        });
      }
    }

    return {
      message: 'Assessment berhasil diperbarui',
    };
  }

  async jawab(
    id_assessment: number,
    body: {
      token?: string;
      id_user?: number;
      id_guru_assessment?: number;
      nama_pengisi?: string;
      nama_guru_snapshot?: string;
      jawaban: { id_pertanyaan: number; jawaban: string; skor?: number }[];
    },
  ) {
    const assessment = await this.assessmentRepo.findOne({
      where: { id_assessment },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment tidak ditemukan');
    }

    if (!assessment.sent_at) {
      throw new BadRequestException(
        'Assessment belum dikirim dan belum dapat diisi.',
      );
    }

    if (!assessment.aktif) {
      throw new BadRequestException(
        'Assessment sedang pending. Guru belum bisa mengisi assessment ini.',
      );
    }

    if (isAssessmentExpired(assessment)) {
      throw new BadRequestException(
        'Tenggat assessment sudah selesai. Jawaban tidak bisa dikirim lagi.',
      );
    }

    let id_guru_assessment = body.id_guru_assessment;
    let nama_guru = body.nama_pengisi;

    // Verifikasi token jika tidak ada id_guru_assessment
    if (body.token && !id_guru_assessment) {
      try {
        const decoded: any = jwt.verify(body.token, process.env.JWT_SECRET);

        if (decoded.type !== 'guru-access') {
          throw new Error('Invalid token type');
        }

        id_guru_assessment = decoded.id_guru_assessment;
        nama_guru = decoded.nama_guru;
      } catch (error) {
        throw new UnauthorizedException(
          'Token akses tidak valid atau sudah kadaluarsa',
        );
      }
    }

    if (!id_guru_assessment) {
      throw new BadRequestException('Guru tidak teridentifikasi');
    }

    // Ambil data guru dari database
    const guru = await this.guruRepo.findOne({
      where: { id_guru_assessment },
    });

    if (!guru) {
      throw new NotFoundException('Data guru tidak ditemukan');
    }

    if (!guru.is_active) {
      throw new UnauthorizedException('Akun guru tidak aktif');
    }

    const finalNamaPengisi = nama_guru || body.nama_pengisi || guru.nama_guru;

    if (!finalNamaPengisi || !finalNamaPengisi.trim()) {
      throw new BadRequestException('Nama pengisi wajib diisi');
    }

    if (!Array.isArray(body.jawaban) || body.jawaban.length === 0) {
      throw new BadRequestException('Jawaban tidak boleh kosong');
    }

    const pertanyaan = await this.pertanyaanRepo.find({
      where: { id_assessment },
    });

    const allowedQuestionIds = pertanyaan.map((item) => item.id_pertanyaan);

    const invalidQuestion = body.jawaban.find(
      (item) => !allowedQuestionIds.includes(Number(item.id_pertanyaan)),
    );

    if (invalidQuestion) {
      throw new BadRequestException(
        'Terdapat jawaban untuk pertanyaan yang tidak valid',
      );
    }

    // Hapus jawaban lama
    await this.jawabanRepo
      .createQueryBuilder()
      .delete()
      .from('assessment_jawaban')
      .where('id_pertanyaan IN (:...ids)', { ids: allowedQuestionIds })
      .andWhere('id_guru_assessment = :id_guru_assessment', {
        id_guru_assessment,
      })
      .execute();

    // Simpan jawaban baru
    const simpanJawaban = body.jawaban.map((j) => {
      return this.jawabanRepo.save({
        id_pertanyaan: Number(j.id_pertanyaan),
        id_user: body.id_user || null,
        id_guru_assessment,
        nama_pengisi: finalNamaPengisi,
        nama_guru_snapshot: body.nama_guru_snapshot || finalNamaPengisi,
        jawaban: j.jawaban,
        skor: j.skor || 0,
      });
    });

    await Promise.all(simpanJawaban);

    return {
      success: true,
      message: `Assessment berhasil dikirim oleh ${finalNamaPengisi}`,
    };
  }

  async findBySekolah(id_sekolah: number, id_user: number) {
    try {
      const cleanIdSekolah = Number(id_sekolah);
      const cleanIdUser = Number(id_user);

      if (isNaN(cleanIdSekolah) || cleanIdSekolah <= 0) return [];

      const assessments = await this.assessmentRepo
        .createQueryBuilder('a')
        .leftJoin('m_users', 'u', 'u.id_user = a.id_ho')
        .select([
          'a.id_assessment AS id_assessment',
          'a.nama AS nama',
          'a.status AS status',
          'a.aktif AS aktif',
          'a.sent_at AS sent_at',
          'a.paused_at AS paused_at',
          'a.total_paused_seconds AS total_paused_seconds',
          'a.tenggat AS tenggat',
          'a.jenis AS jenis',
          'a.pilar AS pilar',
          'u.nama AS ho',
        ])
        .where(':id_sekolah = ANY(a.target_sekolah_ids)', {
          id_sekolah: cleanIdSekolah,
        })
        .andWhere('a.sent_at IS NOT NULL')
        .andWhere('a.aktif = true')
        .getRawMany();

      for (const a of assessments) {
        const deadline = getAssessmentDeadline(a as any);
        const isExpired = isAssessmentExpired(a as any);
        a.deadline = deadline;
        a.remaining_seconds = getAssessmentRemainingSeconds(a as any);
        a.sisa_hari = getAssessmentRemainingDays(a as any);
        a.is_expired = isExpired;
        a.is_paused = Boolean(a.sent_at && a.aktif === false);
        a.status_display = isExpired ? 'Selesai' : a.status;
      }

      const assessmentIds = assessments.map((a) => a.id_assessment);
      const hasValidUser = !isNaN(cleanIdUser) && cleanIdUser > 0;

      if (assessmentIds.length > 0 && hasValidUser) {
        const allPertanyaan = await this.pertanyaanRepo.find({
          where: { id_assessment: In(assessmentIds) },
        });

        const pertanyaanIdsByAssessment = new Map<number, number[]>();
        for (const p of allPertanyaan) {
          const list = pertanyaanIdsByAssessment.get(p.id_assessment) || [];
          list.push(p.id_pertanyaan);
          pertanyaanIdsByAssessment.set(p.id_assessment, list);
        }

        const allPertanyaanIds = allPertanyaan.map((p) => p.id_pertanyaan);
        const filledPertanyaanIds = new Set<number>();

        if (allPertanyaanIds.length > 0) {
          const jawabanCounts = await this.jawabanRepo
            .createQueryBuilder('aj')
            .select('aj.id_pertanyaan', 'id_pertanyaan')
            .where('aj.id_pertanyaan IN (:...ids)', { ids: allPertanyaanIds })
            .andWhere('aj.id_user = :id_user', { id_user: cleanIdUser })
            .groupBy('aj.id_pertanyaan')
            .getRawMany();

          for (const row of jawabanCounts) {
            filledPertanyaanIds.add(Number(row.id_pertanyaan));
          }
        }

        for (const a of assessments) {
          const pertanyaanIds = pertanyaanIdsByAssessment.get(a.id_assessment) || [];
          a.sudah_diisi =
            pertanyaanIds.length > 0 &&
            pertanyaanIds.some((id) => filledPertanyaanIds.has(id));
        }
      } else {
        for (const a of assessments) {
          a.sudah_diisi = false;
        }
      }

      return assessments;
    } catch (error) {
      this.logger.error('ERROR findBySekolah:', error);
      return [];
    }
  }

  async send(id: number) {
    const assessment = await this.assessmentRepo.findOne({
      where: { id_assessment: id },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment tidak ditemukan');
    }

    if (assessment.sent_at) {
      throw new BadRequestException('Assessment sudah pernah dikirim.');
    }

    const now = new Date();
    assessment.status = 'Proses Pengisian';
    assessment.sent_at = now;
    assessment.aktif = true;
    assessment.paused_at = null;
    assessment.total_paused_seconds = 0;
    assessment.updated_at = now;

    await this.assessmentRepo.save(assessment);
    await this.notifyAssessmentSent(assessment).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`ASSESSMENT_SENT_NOTIFICATION_ERROR: ${message}`);
    });

    return {
      message: 'Assessment berhasil dikirim',
      aktif: assessment.aktif,
      sent_at: assessment.sent_at,
      paused_at: assessment.paused_at,
      total_paused_seconds: assessment.total_paused_seconds,
      remaining_seconds: getAssessmentRemainingSeconds(assessment),
      deadline: getAssessmentDeadline(assessment),
      status_pengisian: 'Proses Pengisian',
    };
  }

  async toggleAktif(id: number) {
    const assessment = await this.assessmentRepo.findOne({
      where: { id_assessment: id },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment tidak ditemukan');
    }

    if (!assessment.sent_at) {
      throw new BadRequestException(
        'Assessment belum dikirim sehingga belum dapat dipending.',
      );
    }

    if (isAssessmentExpired(assessment)) {
      throw new BadRequestException(
        'Assessment sudah selesai atau tenggatnya telah habis.',
      );
    }

    const normalizedStatus = String(assessment.status || '').toLowerCase();
    if (normalizedStatus.includes('selesai')) {
      throw new BadRequestException(
        'Assessment yang sudah selesai tidak dapat diubah.',
      );
    }

    const now = new Date();

    if (assessment.aktif) {
      assessment.aktif = false;
      assessment.paused_at = now;
      assessment.status = 'Pending';
    } else {
      if (assessment.paused_at) {
        const pausedAtMs = new Date(assessment.paused_at).getTime();
        if (!Number.isNaN(pausedAtMs)) {
          const pausedDurationSeconds = Math.max(
            0,
            Math.floor((now.getTime() - pausedAtMs) / SECOND_MS),
          );
          assessment.total_paused_seconds =
            Number(assessment.total_paused_seconds || 0) +
            pausedDurationSeconds;
        }
      }

      assessment.aktif = true;
      assessment.paused_at = null;
      assessment.status = 'Proses Pengisian';
    }

    assessment.updated_at = now;
    await this.assessmentRepo.save(assessment);

    return {
      message: assessment.aktif
        ? 'Assessment berhasil dilanjutkan'
        : 'Assessment berhasil dipending',
      aktif: assessment.aktif,
      status: assessment.status,
      paused_at: assessment.paused_at,
      total_paused_seconds: assessment.total_paused_seconds || 0,
      remaining_seconds: getAssessmentRemainingSeconds(assessment),
      deadline: getAssessmentDeadline(assessment),
      status_pengisian: assessment.aktif ? 'Proses Pengisian' : 'Pending',
    };
  }
}
