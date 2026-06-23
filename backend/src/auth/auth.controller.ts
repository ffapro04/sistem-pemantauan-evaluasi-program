/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/login — semua role kecuali Guru Assessment
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  // POST /auth/login-guru — khusus Guru Assessment (role 8)
  // Body: { id_sekolah, nama_guru, password }
  @Post('login-guru')
  loginGuru(@Body() body: any) {
    return this.authService.loginGuru(
      body.id_sekolah,
      body.nama_guru,
      body.password,
    );
  }
}
