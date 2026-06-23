/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AssessmentGuru } from '../assessment-guru/entities/assessment-guru.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,

    @InjectRepository(AssessmentGuru)
    private readonly guruRepo: Repository<AssessmentGuru>,
  ) {}

  // =========================================================================
  // LOGIN SISTEM
  // Admin, Pengurus, HO, AO, Sekolah, Vendor, Kepala Dinas, Operator Sekolah
  // =========================================================================
  async login(email: string, passwordInput: string) {
    const cleanEmail = String(email || '')
      .trim()
      .toLowerCase();
    const cleanPassword = String(passwordInput || '').trim();

    if (!cleanEmail || !cleanPassword) {
      throw new UnauthorizedException('Email dan password wajib diisi');
    }

    const user = await this.usersService.findByEmail(cleanEmail);

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    if (String(user.password || '') !== cleanPassword) {
      throw new UnauthorizedException('Password salah');
    }

    const roleRel = user.role || null;
    const sekolahRel = user.sekolah || null;

    const wilayahList = Array.isArray((user as any).wilayah)
      ? (user as any).wilayah
      : (user as any).wilayah
        ? [(user as any).wilayah]
        : [];

    const primaryWilayah = wilayahList[0] || null;

    const idRole = Number(user.id_role || roleRel?.id_role || 0) || null;

    const roleName = roleRel?.nama_role || 'No Role';

    const idSekolah = user.id_sekolah || sekolahRel?.id_sekolah || null;

    const payload = {
      sub: user.id_user,
      id_user: user.id_user,

      nama: user.nama,
      email: user.email,

      id_role: idRole,
      role: roleName,
      nama_role: roleName,

      jabatan: user.jabatan || '',
      jenis: user.jenis || null,
      sub_jenis: user.sub_jenis || null,

      id_sekolah: idSekolah,

      sekolah: sekolahRel
        ? {
            id_sekolah: sekolahRel.id_sekolah,
            nama_sekolah: sekolahRel.nama_sekolah,
            jenjang: sekolahRel.jenjang,
            npsn: sekolahRel.npsn,
            logo_url: sekolahRel.logo_url,
          }
        : null,

      id_wilayah: primaryWilayah?.id_wilayah || null,

      wilayah: primaryWilayah
        ? {
            id_wilayah: primaryWilayah.id_wilayah,
            nama_wilayah: primaryWilayah.nama_wilayah,
            kode_wilayah: primaryWilayah.kode_wilayah,
            jenis_wilayah: primaryWilayah.jenis_wilayah,
          }
        : null,

      wilayahs: wilayahList.map((wilayah) => ({
        id_wilayah: wilayah.id_wilayah,
        nama_wilayah: wilayah.nama_wilayah,
        kode_wilayah: wilayah.kode_wilayah,
        jenis_wilayah: wilayah.jenis_wilayah,
      })),

      status: user.status ?? true,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // =========================================================================
  // LOGIN GURU ASSESSMENT
  // =========================================================================
  async loginGuru(id_sekolah: number, nama_guru: string, password: string) {
    const cleanIdSekolah = Number(id_sekolah);
    const cleanNama = String(nama_guru || '')
      .trim()
      .replace(/\s+/g, ' ');
    const cleanPassword = String(password || '').trim();

    if (!cleanIdSekolah || Number.isNaN(cleanIdSekolah)) {
      throw new UnauthorizedException('ID Sekolah tidak valid');
    }

    if (!cleanNama || !cleanPassword) {
      throw new UnauthorizedException('Nama guru dan password wajib diisi');
    }

    const guru = await this.guruRepo
      .createQueryBuilder('g')
      .where('g.id_sekolah = :id_sekolah', {
        id_sekolah: cleanIdSekolah,
      })
      .andWhere('LOWER(TRIM(g.nama_guru)) = LOWER(TRIM(:nama_guru))', {
        nama_guru: cleanNama,
      })
      .getOne();

    if (!guru) {
      throw new UnauthorizedException('Nama guru atau password salah');
    }

    if (!guru.is_active) {
      throw new UnauthorizedException('Akun guru tidak aktif');
    }

    if (cleanPassword !== String(guru.password_hash || '')) {
      throw new UnauthorizedException('Nama guru atau password salah');
    }

    guru.last_login_at = new Date();
    await this.guruRepo.save(guru);

    const payload = {
      sub: guru.id_guru_assessment,
      id_guru_assessment: guru.id_guru_assessment,

      nama: guru.nama_guru,
      nama_guru: guru.nama_guru,

      id_role: 8,
      role: 'Guru Assessment',
      nama_role: 'Guru Assessment',

      id_sekolah: guru.id_sekolah,

      jenis_guru: (guru as any).jenis_guru || '',
      mata_pelajaran: guru.mata_pelajaran || '',
      kelas_wali: (guru as any).kelas_wali || '',
      jurusan: (guru as any).jurusan || '',

      type: 'guru-assessment',
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
