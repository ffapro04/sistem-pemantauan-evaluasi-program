/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AssessmentGuruService } from './assessment-guru.service';
import { RegisterGuruDto } from './dto/register-guru.dto';
import { LoginGuruDto } from './dto/login-guru.dto';
import { ResetPasswordGuruDto } from './dto/reset-password-guru.dto';

@Controller('assessment-guru')
export class AssessmentGuruController {
  constructor(private readonly assessmentGuruService: AssessmentGuruService) {}

  // ─── AUTH ─────────────────────────────────────────────────────────────────────

  @Post('register')
  register(@Body() dto: RegisterGuruDto) {
    return this.assessmentGuruService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginGuruDto) {
    return this.assessmentGuruService.login(dto);
  }

  @Patch('reset-password')
  resetPassword(@Body() dto: ResetPasswordGuruDto) {
    return this.assessmentGuruService.resetPassword(dto);
  }

  // ─── READ ─────────────────────────────────────────────────────────────────────

  // Semua guru (aktif + nonaktif) — untuk operator sekolah (DataGuru)
  @Get('sekolah/:id_sekolah')
  findBySekolah(@Param('id_sekolah') id_sekolah: string) {
    return this.assessmentGuruService.findBySekolah(+id_sekolah);
  }

  // Hanya guru aktif — untuk role guru (DaftarGuru)
  @Get('sekolah/:id_sekolah/aktif')
  findAktifBySekolah(@Param('id_sekolah') id_sekolah: string) {
    return this.assessmentGuruService.findAktifBySekolah(+id_sekolah);
  }

  // Detail satu guru by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assessmentGuruService.findOne(+id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────────

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.assessmentGuruService.update(+id, body);
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────────

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assessmentGuruService.remove(+id);
  }

  // ─── TOKEN (lama, tetap dipertahankan) ───────────────────────────────────────

  @Post('generate-token/:id')
  generateToken(@Param('id') id: string) {
    return this.assessmentGuruService.generateAccessToken(+id);
  }
}
