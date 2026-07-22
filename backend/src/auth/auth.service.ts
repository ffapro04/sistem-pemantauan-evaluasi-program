/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AssessmentGuru } from '../assessment-guru/entities/assessment-guru.entity';
import { EmailService } from './email.service';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { NotificationRecipientType } from '../notifikasi/entities/notifikasi.entity';
import { createHash, randomInt } from 'node:crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,

    @InjectRepository(AssessmentGuru)
    private readonly guruRepo: Repository<AssessmentGuru>,

    private readonly emailService: EmailService,
    private readonly notifikasiService: NotifikasiService,
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

    this.validateEmail(cleanEmail);

    if (!cleanPassword) {
      throw new BadRequestException('Password wajib diisi');
    }

    const user = await this.usersService.findByEmail(cleanEmail);

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const storedPassword = String(user.password || '');
    const isHashedPassword = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$');
    const passwordMatches = isHashedPassword
      ? await bcrypt.compare(cleanPassword, storedPassword)
      : storedPassword === cleanPassword;

    if (!passwordMatches) {
      throw new UnauthorizedException('Email atau password salah');
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

  private normalizeEmail(email: string) {
    return String(email || '')
      .trim()
      .toLowerCase();
  }

  private validateEmail(email: string) {
    if (!email) {
      throw new BadRequestException('Email wajib diisi');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Format email tidak valid');
    }
  }

  private hashOtp(email: string, otp: string) {
    const secret = process.env.PASSWORD_RESET_SECRET || process.env.JWT_SECRET || 'SECRET_KEY';
    return createHash('sha256')
      .update(`${email}:${otp}:${secret}`)
      .digest('hex');
  }

  private generateOtp() {
    return String(randomInt(100000, 999999));
  }

  private async ensurePasswordResetTable() {
    await this.guruRepo.manager.query(`
      CREATE TABLE IF NOT EXISTS t_password_reset_otp (
        id_reset SERIAL PRIMARY KEY,
        id_user INTEGER NOT NULL,
        email VARCHAR(255) NOT NULL,
        otp_hash VARCHAR(128) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP NULL,
        attempt_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await this.guruRepo.manager.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_otp_email
      ON t_password_reset_otp (LOWER(email), created_at DESC)
    `);
  }

  private async createPasswordResetNotification(user: any, title: string, message: string) {
    try {
      await this.notifikasiService.createMany([
        {
          recipientType: NotificationRecipientType.USER,
          recipientId: Number(user.id_user),
          legacyUserId: Number(user.id_user),
          judul: title,
          pesan: message,
          tipe: 'PASSWORD_RESET',
          targetUrl: '/login',
          metadata: {
            email: user.email,
            event: 'password_reset',
          },
        },
      ]);
    } catch {
      // Notifikasi sistem tidak boleh menggagalkan reset password email.
    }
  }

  async requestForgotPassword(email: string) {
    const cleanEmail = this.normalizeEmail(email);
    this.validateEmail(cleanEmail);

    const user = await this.usersService.findByEmail(cleanEmail);

    if (!user) {
      throw new BadRequestException('Email tidak ditemukan');
    }

    await this.ensurePasswordResetTable();

    const recentRows = await this.guruRepo.manager.query(
      `
        SELECT COUNT(*)::int AS total
        FROM t_password_reset_otp
        WHERE LOWER(email) = LOWER($1)
          AND created_at >= NOW() - INTERVAL '30 seconds'
      `,
      [cleanEmail],
    );

    const recentTotal = Number(recentRows?.[0]?.total || 0);

    if (recentTotal >= 10) {
      throw new BadRequestException('Batas kirim OTP tercapai. Tunggu 30 detik lalu coba lagi.');
    }

    const otp = this.generateOtp();
    const expiryMinutes = Number(process.env.PASSWORD_RESET_OTP_MINUTES || 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60_000);

    await this.emailService.sendMail({
      to: cleanEmail,
      subject: 'Kode OTP Reset Password - Sistem Monitoring Evaluasi',
      text: [
        `Halo ${user.nama || 'User'},`,
        '',
        `Kode OTP reset password Anda adalah: ${otp}`,
        `Kode ini berlaku selama ${expiryMinutes} menit.`,
        '',
        'Jika Anda tidak meminta reset password, abaikan email ini.',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h2 style="margin:0 0 12px;color:#0AC4E0">Reset Password</h2>
          <p>Halo <strong>${user.nama || 'User'}</strong>,</p>
          <p>Kode OTP reset password Anda:</p>
          <div style="font-size:28px;font-weight:800;letter-spacing:8px;padding:14px 18px;background:#f1f5f9;border-radius:12px;display:inline-block">${otp}</div>
          <p>Kode ini berlaku selama <strong>${expiryMinutes} menit</strong>.</p>
          <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        </div>
      `,
    });

    await this.guruRepo.manager.query(
      `
        INSERT INTO t_password_reset_otp (id_user, email, otp_hash, expires_at)
        VALUES ($1, $2, $3, $4)
      `,
      [user.id_user, cleanEmail, this.hashOtp(cleanEmail, otp), expiresAt],
    );

    await this.createPasswordResetNotification(
      user,
      'OTP reset password dikirim',
      'Kode OTP reset password sudah dikirim ke email akun Anda.',
    );

    return {
      success: true,
      message: 'OTP reset password sudah dikirim ke email akun Anda.',
      expires_in_minutes: expiryMinutes,
    };
  }

  async verifyForgotPassword(data: {
    email?: string;
    otp?: string;
    password?: string;
    password_confirmation?: string;
  }) {
    const cleanEmail = this.normalizeEmail(data?.email || '');
    const otp = String(data?.otp || '').trim();
    const password = String(data?.password || '').trim();
    const passwordConfirmation = String(
      data?.password_confirmation || '',
    ).trim();

    this.validateEmail(cleanEmail);

    if (!/^\d{6}$/.test(otp)) {
      throw new BadRequestException('Kode OTP harus 6 digit');
    }

    if (!password || password.length < 8) {
      throw new BadRequestException('Password baru minimal 8 karakter');
    }

    if (password !== passwordConfirmation) {
      throw new BadRequestException('Konfirmasi password tidak sama');
    }

    const user = await this.usersService.findByEmail(cleanEmail);

    if (!user) {
      throw new BadRequestException('Email tidak ditemukan');
    }

    await this.ensurePasswordResetTable();

    const rows = await this.guruRepo.manager.query(
      `
        SELECT id_reset, otp_hash, expires_at, used_at, attempt_count
        FROM t_password_reset_otp
        WHERE LOWER(email) = LOWER($1)
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [cleanEmail],
    );

    const reset = rows?.[0];

    if (!reset) {
      throw new BadRequestException('OTP belum diminta atau sudah kedaluwarsa');
    }

    if (reset.used_at) {
      throw new BadRequestException('OTP sudah digunakan. Minta kode baru.');
    }

    if (new Date(reset.expires_at).getTime() < Date.now()) {
      throw new BadRequestException('OTP sudah kedaluwarsa. Minta kode baru.');
    }

    if (Number(reset.attempt_count || 0) >= 5) {
      throw new BadRequestException('Percobaan OTP terlalu banyak. Minta kode baru.');
    }

    if (reset.otp_hash !== this.hashOtp(cleanEmail, otp)) {
      await this.guruRepo.manager.query(
        `
          UPDATE t_password_reset_otp
          SET attempt_count = attempt_count + 1
          WHERE id_reset = $1
        `,
        [reset.id_reset],
      );

      throw new BadRequestException('Kode OTP tidak valid');
    }

    user.password = password;
    await this.usersService.saveUserPassword(user);

    await this.guruRepo.manager.query(
      `
        UPDATE t_password_reset_otp
        SET used_at = NOW()
        WHERE id_reset = $1
      `,
      [reset.id_reset],
    );

    await this.createPasswordResetNotification(
      user,
      'Password berhasil diganti',
      'Password akun Anda berhasil diganti melalui verifikasi OTP email.',
    );

    return {
      success: true,
      message: 'Password berhasil diperbarui. Silakan login dengan password baru.',
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
