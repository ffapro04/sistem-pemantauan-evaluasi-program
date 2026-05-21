/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, passwordInput: string) {
    // findByEmail sudah kita pastikan men-select password & id_role
    const user = await this.usersService.findByEmail(email);

    console.log('====== DATA USER DARI DATABASE ======\n', user);

  if (!user) {
    throw new UnauthorizedException('User tidak ditemukan');
  }

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // Perbandingan Plain Text Password
    if (user.password !== passwordInput) {
      throw new UnauthorizedException('Password salah');
    }

    // PAYLOAD: Ini data yang akan di-decode oleh jwtDecode di Sidebar.jsx
    const payload = {
      sub: user.id_user,
      email: user.email,
      nama: user.nama,
      // SANGAT PENTING: Masukkan id_role (angka) agar Sidebar tidak "NO ROLE"
      id_role: user.id_role || (user.role ? user.role.id_role : null),
      role: user?.role?.nama_role || 'No Role',
      id_sekolah: user.id_sekolah || (user.sekolah ? user.sekolah.id_sekolah : null),
      jenis: user.jenis,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
