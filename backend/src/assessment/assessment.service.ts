/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Assessment } from './entities/assessment.entity';
import { AssessmentPertanyaan } from './entities/assessment-pertanyaan.entity';
import { AssessmentJawaban } from './entities/assessment-jawaban.entity';
import { Sekolah } from '../sekolah/entities/sekolah.entity';
import { User } from '../users/user.entity';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

@Injectable()
export class AssessmentService {
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
  ) {}

  async create(dto: CreateAssessmentDto) {
    const assessment = await this.assessmentRepo.save({
      id_ho: dto.id_ho,
      nama: dto.nama,
      target_sekolah_ids: dto.target_sekolah_ids || [],
      tenggat: dto.tenggat ?? 7,
      jenis: dto.jenis ?? 'non-akademik',
      status: 'Siap Diajukan',
      aktif: true,
      sent_at: null,
    });

    for (let i = 0; i < dto.questions.length; i++) {
      await this.pertanyaanRepo.save({
        id_assessment: assessment.id_assessment,
        pertanyaan: dto.questions[i].question,
        options: dto.questions[i].options,
        urutan: i + 1,
      });
    }

    return {
      message: 'Assessment berhasil dibuat',
      id_assessment: assessment.id_assessment,
    };
  }

  async findAll(jenis?: string, id_ho?: number) {
    const query = this.assessmentRepo
      .createQueryBuilder('a')
      .leftJoin('m_users', 'u', 'u.id_user = a.id_ho')
      .leftJoin('m_sekolah', 's', 's.id_sekolah = ANY(a.target_sekolah_ids)')
      .leftJoin(
        't_assessment_pertanyaan',
        'ap',
        'ap.id_assessment = a.id_assessment',
      )
      .leftJoin(
        'assessment_jawaban',
        'aj',
        'aj.id_pertanyaan = ap.id_pertanyaan',
      )
      .select([
        'a.id_assessment AS id_assessment',
        'a.nama AS nama',
        'a.status AS status',
        'a.aktif AS aktif',
        'a.sent_at AS sent_at',
        'a.tenggat AS tenggat',
        'a.jenis AS jenis',
        'u.nama AS ho',
        "STRING_AGG(DISTINCT s.nama_sekolah, ', ') AS daftar_sekolah",
        'COUNT(DISTINCT aj.nama_pengisi) AS jumlah_pengisi',
      ])
      .groupBy('a.id_assessment, u.nama, a.sent_at, a.tenggat, a.jenis');

    if (jenis) query.andWhere('a.jenis = :jenis', { jenis });
    if (id_ho) query.andWhere('a.id_ho = :id_ho', { id_ho });

    return query.getRawMany();
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

    const tanggalSelesai = assessment.sent_at
      ? new Date(
          new Date(assessment.sent_at).setDate(
            new Date(assessment.sent_at).getDate() + (assessment.tenggat ?? 7),
          ),
        )
      : null;

    return {
      id_assessment: assessment.id_assessment,
      nama: assessment.nama,
      status: assessment.status,
      aktif: assessment.aktif,
      sent_at: assessment.sent_at,
      tenggat: assessment.tenggat,
      tanggal_selesai: tanggalSelesai,
      questions: pertanyaan.map((p) => ({
        id_pertanyaan: p.id_pertanyaan,
        question: p.pertanyaan,
        options: Array.isArray(p.options) ? p.options : [],
      })),
    };
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

    const deadline = assessment.sent_at
      ? new Date(
          new Date(assessment.sent_at).setDate(
            new Date(assessment.sent_at).getDate() + (assessment.tenggat ?? 7),
          ),
        )
      : null;

    return {
      id_assessment: assessment.id_assessment,
      nama_assessment: assessment.nama,
      jenis: assessment.jenis,
      sent_at: assessment.sent_at || null,
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
        a.jenis
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
    if (body.target_sekolah_ids !== undefined) {
      assessment.target_sekolah_ids = body.target_sekolah_ids;
    }

    await this.assessmentRepo.save(assessment);

    await this.pertanyaanRepo.delete({ id_assessment: id });

    const questions = body.questions || [];

    for (let i = 0; i < questions.length; i++) {
      await this.pertanyaanRepo.save({
        id_assessment: id,
        pertanyaan: questions[i].question,
        options: questions[i].options,
        urutan: i + 1,
      });
    }

    return {
      message: 'Assessment berhasil diperbarui',
    };
  }

  async jawab(
    id_assessment: number,
    body: {
      id_user: number;
      id_guru_assessment?: number;
      nama_pengisi: string;
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

    if (!body.id_guru_assessment) {
      throw new Error('Guru wajib login terlebih dahulu');
    }

    if (!body.nama_pengisi || !body.nama_pengisi.trim()) {
      throw new Error('Nama pengisi wajib diisi');
    }

    if (!Array.isArray(body.jawaban) || body.jawaban.length === 0) {
      throw new Error('Jawaban tidak boleh kosong');
    }

    const pertanyaan = await this.pertanyaanRepo.find({
      where: { id_assessment },
    });

    const allowedQuestionIds = pertanyaan.map((item) => item.id_pertanyaan);

    const invalidQuestion = body.jawaban.find(
      (item) => !allowedQuestionIds.includes(Number(item.id_pertanyaan)),
    );

    if (invalidQuestion) {
      throw new Error('Terdapat jawaban untuk pertanyaan yang tidak valid');
    }

    await this.jawabanRepo
      .createQueryBuilder()
      .delete()
      .from('assessment_jawaban')
      .where('id_pertanyaan IN (:...ids)', { ids: allowedQuestionIds })
      .andWhere('id_guru_assessment = :id_guru_assessment', {
        id_guru_assessment: body.id_guru_assessment,
      })
      .execute();

    const simpanJawaban = body.jawaban.map((j) => {
      return this.jawabanRepo.save({
        id_pertanyaan: Number(j.id_pertanyaan),
        id_user: body.id_user,
        id_guru_assessment: body.id_guru_assessment,
        nama_pengisi: body.nama_pengisi,
        nama_guru_snapshot: body.nama_guru_snapshot || body.nama_pengisi,
        jawaban: j.jawaban,
        skor: j.skor || 0,
      });
    });

    await Promise.all(simpanJawaban);

    return {
      success: true,
      message: `Assessment berhasil dikirim oleh ${body.nama_pengisi}`,
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
          'a.tenggat AS tenggat',
          'u.nama AS ho',
        ])
        .where(':id_sekolah = ANY(a.target_sekolah_ids)', {
          id_sekolah: cleanIdSekolah,
        })
        .andWhere('a.sent_at IS NOT NULL')
        .andWhere('a.aktif = true')
        .getRawMany();

      for (const a of assessments) {
        const pertanyaan = await this.pertanyaanRepo.find({
          where: { id_assessment: a.id_assessment },
        });

        if (!isNaN(cleanIdUser) && cleanIdUser > 0 && pertanyaan.length > 0) {
          const ids = pertanyaan.map((p) => p.id_pertanyaan);

          const jumlah = await this.jawabanRepo
            .createQueryBuilder('aj')
            .where('aj.id_pertanyaan IN (:...ids)', { ids })
            .andWhere('aj.id_user = :id_user', { id_user: cleanIdUser })
            .getCount();

          a.sudah_diisi = jumlah > 0;
        } else {
          a.sudah_diisi = false;
        }
      }

      return assessments;
    } catch (error) {
      console.error('ERROR findBySekolah:', error);
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

    assessment.status = 'Proses Pengisian';
    assessment.sent_at = new Date();

    await this.assessmentRepo.save(assessment);

    return {
      message: 'Assessment berhasil dikirim',
    };
  }

  async toggleAktif(id: number) {
    const assessment = await this.assessmentRepo.findOne({
      where: { id_assessment: id },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment tidak ditemukan');
    }

    assessment.aktif = !assessment.aktif;

    await this.assessmentRepo.save(assessment);

    return {
      message: 'Status assessment berhasil diubah',
      aktif: assessment.aktif,
    };
  }
}
