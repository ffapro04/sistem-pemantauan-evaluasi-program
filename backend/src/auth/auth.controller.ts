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

  // POST /auth/forgot-password/request — kirim OTP ke email akun sistem
  @Post('forgot-password/request')
  requestForgotPassword(@Body() body: any) {
    return this.authService.requestForgotPassword(body.email);
  }

  // POST /auth/forgot-password/verify — verifikasi OTP lalu ganti password
  @Post('forgot-password/verify')
  verifyForgotPassword(@Body() body: any) {
    return this.authService.verifyForgotPassword({
      email: body.email,
      otp: body.otp,
      password: body.password,
      password_confirmation: body.password_confirmation,
    });
  }

  // Kompatibilitas lama: body wajib membawa otp.
  @Post('forgot-password')
  forgotPassword(@Body() body: any) {
    return this.authService.verifyForgotPassword({
      email: body.email,
      otp: body.otp,
      password: body.password,
      password_confirmation: body.password_confirmation,
    });
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
