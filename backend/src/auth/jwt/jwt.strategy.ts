/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET tidak ditemukan di environment. Set JWT_SECRET sebelum menjalankan aplikasi.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    /**
     * Penting:
     * Return payload lengkap agar controller lain bisa membaca:
     * - id_user
     * - id_role
     * - id_sekolah
     * - nama
     * - email
     * - role
     *
     * Kalau cuma return userId/email/role, GoogleDriveController akan gagal
     * karena dia butuh id_user.
     */
    return {
      ...payload,

      userId: payload.sub || payload.id_user || payload.id || null,
      id_user: payload.id_user || payload.sub || payload.id || null,
      id: payload.id_user || payload.sub || payload.id || null,
      sub: payload.sub || payload.id_user || payload.id || null,

      id_role: payload.id_role || payload.role_id || null,
      role: payload.role || payload.nama_role || null,
      nama_role: payload.nama_role || payload.role || null,

      email: payload.email || null,
      nama: payload.nama || payload.name || null,

      id_sekolah: payload.id_sekolah || null,
      id_wilayah: payload.id_wilayah || null,
    };
  }
}
