/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';

import { AssessmentGuru } from './entities/assessment-guru.entity';
import { Sekolah } from '../sekolah/entities/sekolah.entity';
import { RegisterGuruDto } from './dto/register-guru.dto';
import { LoginGuruDto } from './dto/login-guru.dto';
import { ResetPasswordGuruDto } from './dto/reset-password-guru.dto';
import { NotifikasiService } from '../notifikasi/notifikasi.service';

@Injectable()
export class AssessmentGuruService {
  constructor(
    @InjectRepository(AssessmentGuru)
    private readonly guruRepo: Repository<AssessmentGuru>,

    @InjectRepository(Sekolah)
    private readonly sekolahRepo: Repository<Sekolah>,

    private readonly notifikasiService: NotifikasiService,
  ) {}

  private cleanName(value: string) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ');
  }

  private getIdSekolah(dto: any) {
    const raw =
      dto?.id_sekolah ??
      dto?.idSekolah ??
      dto?.id_school ??
      dto?.idSchool ??
      dto?.sekolah_id;

    return Number(raw);
  }

  private optionalId(value: any): number | null {
    if (value === undefined || value === null || value === '') return null;

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue) || numberValue <= 0) return null;

    return numberValue;
  }

  private safeGuruResponse(guru: AssessmentGuru) {
    const kelasData: any = (guru as any)?.kelas_data || null;
    const jurusanData: any = (guru as any)?.jurusan_data || null;

    const namaKelas =
      kelasData?.nama_kelas || kelasData?.nama || guru.kelas_wali || '';

    const kodeJurusan =
      jurusanData?.kode_jurusan || jurusanData?.kode || guru.jurusan || '';

    const namaJurusan = jurusanData?.nama_jurusan || jurusanData?.nama || '';

    return {
      id_guru_assessment: guru.id_guru_assessment,
      id_sekolah: guru.id_sekolah,
      nama_guru: guru.nama_guru,
      email_guru: guru.email_guru || '',
      no_telepon: guru.no_telepon || '',

      jenis_guru: guru.jenis_guru || '',
      mata_pelajaran: guru.mata_pelajaran || '',

      id_kelas: guru.id_kelas || null,
      kelas_wali: guru.kelas_wali || '',
      nama_kelas: namaKelas,
      kelas_data: kelasData
        ? {
            id_kelas: kelasData.id_kelas,
            nama_kelas: kelasData.nama_kelas,
            tingkat: kelasData.tingkat,
            rombel: kelasData.rombel,
            jurusan: kelasData.jurusan,
            status: kelasData.status,
          }
        : null,

      id_jurusan: guru.id_jurusan || null,
      jurusan: kodeJurusan,
      nama_jurusan: namaJurusan,
      kode_jurusan: kodeJurusan,
      jurusan_data: jurusanData
        ? {
            id_jurusan: jurusanData.id_jurusan,
            nama_jurusan: jurusanData.nama_jurusan,
            kode_jurusan: jurusanData.kode_jurusan,
            status: jurusanData.status,
          }
        : null,

      nip: guru.nip || '',
      is_active: guru.is_active,
      last_login_at: guru.last_login_at,
      created_at: guru.created_at,
      updated_at: guru.updated_at,
    };
  }

  async register(dto: RegisterGuruDto) {
    const idSekolah = this.getIdSekolah(dto);
    const namaGuru = this.cleanName(dto.nama_guru);
    const password = String(dto.password || '').trim();

    if (!idSekolah || Number.isNaN(idSekolah)) {
      throw new BadRequestException('ID sekolah tidak valid');
    }

    if (!namaGuru) {
      throw new BadRequestException('Nama guru wajib diisi');
    }

    if (password.length < 4) {
      throw new BadRequestException('Password guru minimal 4 karakter');
    }

    const sekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: idSekolah },
    });

    if (!sekolah) {
      throw new NotFoundException('Sekolah tidak ditemukan');
    }

    const existing = await this.guruRepo
      .createQueryBuilder('g')
      .where('g.id_sekolah = :id_sekolah', { id_sekolah: idSekolah })
      .andWhere('LOWER(g.nama_guru) = LOWER(:nama_guru)', {
        nama_guru: namaGuru,
      })
      .getOne();

    if (existing) {
      throw new ConflictException(
        'Nama guru sudah terdaftar di sekolah ini. Silakan gunakan menu masuk guru.',
      );
    }

    const idKelas = this.optionalId((dto as any).id_kelas);
    const idJurusan = this.optionalId((dto as any).id_jurusan);

    const guru = await this.guruRepo.save({
      id_sekolah: idSekolah,
      nama_guru: namaGuru,
      email_guru: dto.email_guru?.trim() || '',
      no_telepon: dto.no_telepon?.trim() || '',
      jenis_guru: dto.jenis_guru?.trim() || '',
      mata_pelajaran: dto.mata_pelajaran?.trim() || '',
      id_kelas: idKelas,
      id_jurusan: idJurusan,
      kelas_wali: dto.kelas_wali?.trim() || '',
      jurusan: dto.jurusan?.trim() || '',
      nip: dto.nip?.trim() || '',
      password_hash: password,
      is_active: true,
      last_login_at: new Date(),
    });

    const totalGuruAktif = await this.syncJumlahGuru(idSekolah);
    const namaSekolah = sekolah.nama_sekolah || `Sekolah ID ${idSekolah}`;

    await this.notifikasiService.notifyAdmins({
      judul: 'Guru Baru Ditambahkan',
      pesan: `${namaSekolah} menambahkan guru baru: ${guru.nama_guru}. Total guru aktif sekarang ${totalGuruAktif}.`,
      tipe: 'GURU',
      targetUrl: `/admin/sekolah/detail/${idSekolah}`,
      metadata: {
        action: 'CREATE_GURU',
        id_sekolah: idSekolah,
        id_guru_assessment: guru.id_guru_assessment,
        nama_guru: guru.nama_guru,
        total_guru_aktif: totalGuruAktif,
      },
    });

    const guruWithRelations = await this.guruRepo.findOne({
      where: { id_guru_assessment: guru.id_guru_assessment },
      relations: ['kelas_data', 'jurusan_data'],
    });

    return {
      message: 'Guru berhasil didaftarkan',
      data: this.safeGuruResponse(guruWithRelations || guru),
    };
  }

  async login(dto: LoginGuruDto) {
    const idSekolah = this.getIdSekolah(dto);
    const namaGuru = this.cleanName(dto.nama_guru);
    const password = String(dto.password || '').trim();

    if (!idSekolah || Number.isNaN(idSekolah)) {
      throw new BadRequestException('ID sekolah tidak valid');
    }

    if (!namaGuru || !password) {
      throw new BadRequestException('Nama guru dan password wajib diisi');
    }

    const guru = await this.guruRepo
      .createQueryBuilder('g')
      .where('g.id_sekolah = :id_sekolah', { id_sekolah: idSekolah })
      .andWhere('LOWER(g.nama_guru) = LOWER(:nama_guru)', {
        nama_guru: namaGuru,
      })
      .getOne();

    if (!guru) {
      throw new UnauthorizedException('Nama guru atau password salah');
    }

    if (!guru.is_active) {
      throw new UnauthorizedException('Akun guru tidak aktif');
    }

    if (password !== String(guru.password_hash || '')) {
      throw new UnauthorizedException('Nama guru atau password salah');
    }

    guru.last_login_at = new Date();
    await this.guruRepo.save(guru);

    return {
      message: 'Login guru berhasil',
      guru: this.safeGuruResponse(guru),
    };
  }

  async resetPassword(dto: ResetPasswordGuruDto) {
    const idSekolah = this.getIdSekolah(dto);
    const namaGuru = this.cleanName(dto.nama_guru);
    const emailSekolah = String(dto.email_sekolah || '')
      .trim()
      .toLowerCase();
    const passwordSekolah = String(dto.password_sekolah || '').trim();
    const passwordBaru = String(dto.password_baru || '').trim();

    if (!idSekolah || Number.isNaN(idSekolah)) {
      throw new BadRequestException('ID sekolah tidak valid');
    }

    if (!namaGuru || !emailSekolah || !passwordSekolah || !passwordBaru) {
      throw new BadRequestException('Semua field wajib diisi');
    }

    if (passwordBaru.length < 4) {
      throw new BadRequestException('Password baru minimal 4 karakter');
    }

    const sekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: idSekolah },
    });

    if (!sekolah) {
      throw new NotFoundException('Sekolah tidak ditemukan');
    }

    const emailDb = String(sekolah.email_login || '')
      .trim()
      .toLowerCase();

    if (emailDb !== emailSekolah) {
      throw new UnauthorizedException('Email sekolah tidak sesuai');
    }

    if (passwordSekolah !== String(sekolah.password_login || '')) {
      throw new UnauthorizedException('Password sekolah salah');
    }

    const guru = await this.guruRepo
      .createQueryBuilder('g')
      .where('g.id_sekolah = :id_sekolah', { id_sekolah: idSekolah })
      .andWhere('LOWER(g.nama_guru) = LOWER(:nama_guru)', {
        nama_guru: namaGuru,
      })
      .getOne();

    if (!guru) {
      throw new NotFoundException('Guru tidak ditemukan di sekolah ini');
    }

    guru.password_hash = passwordBaru;
    guru.updated_at = new Date();

    await this.guruRepo.save(guru);

    return {
      message: 'Password guru berhasil diperbarui',
      guru: this.safeGuruResponse(guru),
    };
  }

  // ─── SEMUA GURU (termasuk nonaktif) — untuk DataGuru operator ───────────────
  async findBySekolah(id_sekolah: number) {
    const idSekolah = Number(id_sekolah);

    if (!idSekolah || Number.isNaN(idSekolah)) {
      throw new BadRequestException('ID sekolah tidak valid');
    }

    const guru = await this.guruRepo.find({
      where: { id_sekolah: idSekolah },
      relations: ['kelas_data', 'jurusan_data'],
      order: { nama_guru: 'ASC' },
    });

    return guru.map((item) => this.safeGuruResponse(item));
  }

  // ─── HANYA GURU AKTIF — untuk DaftarGuru (role 8 / guru) ────────────────────
  async findAktifBySekolah(id_sekolah: number) {
    const idSekolah = Number(id_sekolah);

    if (!idSekolah || Number.isNaN(idSekolah)) {
      throw new BadRequestException('ID sekolah tidak valid');
    }

    const guru = await this.guruRepo.find({
      where: { id_sekolah: idSekolah, is_active: true },
      relations: ['kelas_data', 'jurusan_data'],
      order: { nama_guru: 'ASC' },
    });

    return guru.map((item) => this.safeGuruResponse(item));
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────────
  async findOne(id: number) {
    const guru = await this.guruRepo.findOne({
      where: { id_guru_assessment: id },
      relations: ['kelas_data', 'jurusan_data'],
    });

    if (!guru) {
      throw new NotFoundException('Guru tidak ditemukan');
    }

    return this.safeGuruResponse(guru);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────────
  async update(id: number, body: any) {
    const guru = await this.guruRepo.findOne({
      where: { id_guru_assessment: id },
    });

    if (!guru) {
      throw new NotFoundException('Guru tidak ditemukan');
    }

    if (body.nama_guru !== undefined) {
      const namaGuru = this.cleanName(body.nama_guru);

      if (!namaGuru) {
        throw new BadRequestException('Nama guru tidak boleh kosong');
      }

      const duplicate = await this.guruRepo
        .createQueryBuilder('g')
        .where('g.id_sekolah = :id_sekolah', { id_sekolah: guru.id_sekolah })
        .andWhere('LOWER(g.nama_guru) = LOWER(:nama_guru)', {
          nama_guru: namaGuru,
        })
        .andWhere('g.id_guru_assessment != :id', { id })
        .getOne();

      if (duplicate) {
        throw new ConflictException('Nama guru sudah digunakan di sekolah ini');
      }

      guru.nama_guru = namaGuru;
    }

    if (body.email_guru !== undefined) {
      guru.email_guru = String(body.email_guru || '').trim();
    }

    if (body.no_telepon !== undefined) {
      guru.no_telepon = String(body.no_telepon || '').trim();
    }

    if (body.jenis_guru !== undefined) {
      guru.jenis_guru = String(body.jenis_guru || '').trim();
    }

    if (body.mata_pelajaran !== undefined) {
      guru.mata_pelajaran = String(body.mata_pelajaran || '').trim();
    }

    if (body.id_kelas !== undefined) {
      guru.id_kelas = this.optionalId(body.id_kelas);
    }

    if (body.id_jurusan !== undefined) {
      guru.id_jurusan = this.optionalId(body.id_jurusan);
    }

    if (body.kelas_wali !== undefined) {
      guru.kelas_wali = String(body.kelas_wali || '').trim();
    }

    if (body.jurusan !== undefined) {
      guru.jurusan = String(body.jurusan || '').trim();
    }

    if (body.nip !== undefined) {
      guru.nip = String(body.nip || '').trim();
    }

    if (
      body.password !== undefined &&
      String(body.password).trim().length > 0
    ) {
      const newPass = String(body.password).trim();

      if (newPass.length < 4) {
        throw new BadRequestException('Password minimal 4 karakter');
      }

      guru.password_hash = newPass;
    }

    if (body.is_active !== undefined) {
      guru.is_active =
        body.is_active === true ||
        body.is_active === 'true' ||
        body.is_active === 1 ||
        body.is_active === '1' ||
        String(body.is_active).toLowerCase() === 'aktif';
    }

    guru.updated_at = new Date();

    const savedGuru = await this.guruRepo.save(guru);

    const totalGuruAktif = await this.syncJumlahGuru(savedGuru.id_sekolah);
    const namaSekolah = await this.getNamaSekolah(savedGuru.id_sekolah);

    await this.notifikasiService.notifyAdmins({
      judul: 'Data Guru Diperbarui',
      pesan: `${namaSekolah} memperbarui data guru: ${savedGuru.nama_guru}. Total guru aktif sekarang ${totalGuruAktif}.`,
      tipe: 'GURU',
      targetUrl: `/admin/sekolah/detail/${savedGuru.id_sekolah}`,
      metadata: {
        action: 'UPDATE_GURU',
        id_sekolah: savedGuru.id_sekolah,
        id_guru_assessment: savedGuru.id_guru_assessment,
        nama_guru: savedGuru.nama_guru,
        total_guru_aktif: totalGuruAktif,
      },
    });

    const savedGuruWithRelations = await this.guruRepo.findOne({
      where: { id_guru_assessment: savedGuru.id_guru_assessment },
      relations: ['kelas_data', 'jurusan_data'],
    });

    return {
      message: 'Data guru berhasil diperbarui',
      data: this.safeGuruResponse(savedGuruWithRelations || savedGuru),
    };
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────────
  async remove(id: number) {
    const guru = await this.guruRepo.findOne({
      where: { id_guru_assessment: id },
    });

    if (!guru) {
      throw new NotFoundException('Guru tidak ditemukan');
    }

    const idSekolah = guru.id_sekolah;
    const namaGuru = guru.nama_guru;

    await this.guruRepo.remove(guru);

    const totalGuruAktif = await this.syncJumlahGuru(idSekolah);
    const namaSekolah = await this.getNamaSekolah(idSekolah);

    await this.notifikasiService.notifyAdmins({
      judul: 'Guru Dihapus',
      pesan: `${namaSekolah} menghapus guru: ${namaGuru}. Total guru aktif sekarang ${totalGuruAktif}.`,
      tipe: 'GURU',
      targetUrl: `/admin/sekolah/detail/${idSekolah}`,
      metadata: {
        action: 'DELETE_GURU',
        id_sekolah: idSekolah,
        nama_guru: namaGuru,
        total_guru_aktif: totalGuruAktif,
      },
    });

    return { message: 'Guru berhasil dihapus' };
  }

  // ─── GENERATE ACCESS TOKEN (lama, tetap dipertahankan) ───────────────────────
  async generateAccessToken(guruId: number) {
    const guru = await this.guruRepo.findOne({
      where: { id_guru_assessment: guruId },
      relations: ['sekolah'],
    });

    if (!guru) {
      throw new NotFoundException('Guru tidak ditemukan');
    }

    if (!guru.is_active) {
      throw new UnauthorizedException('Akun guru tidak aktif');
    }

    const token = jwt.sign(
      {
        id_guru_assessment: guru.id_guru_assessment,
        id_sekolah: guru.id_sekolah,
        nama_guru: guru.nama_guru,
        role: 'guru',
        type: 'guru-access',
      },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '30d' },
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/guru/akses/${token}`;

    return {
      token,
      link,
      guru: {
        id_guru_assessment: guru.id_guru_assessment,
        nama_guru: guru.nama_guru,
        id_sekolah: guru.id_sekolah,
      },
    };
  }

  private async syncJumlahGuru(idSekolah: number) {
    const totalGuruAktif = await this.guruRepo.count({
      where: {
        id_sekolah: Number(idSekolah),
        is_active: true,
      },
    });

    await this.sekolahRepo.update(
      { id_sekolah: Number(idSekolah) },
      { jumlah_guru: totalGuruAktif },
    );

    return totalGuruAktif;
  }

  private async getNamaSekolah(idSekolah: number) {
    const sekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: Number(idSekolah) },
    });

    return sekolah?.nama_sekolah || `Sekolah ID ${idSekolah}`;
  }
}
