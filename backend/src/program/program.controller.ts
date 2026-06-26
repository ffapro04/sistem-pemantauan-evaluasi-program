/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Query,
  Headers,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProgramService } from './program.service';

const FILE_LIMIT_10_MB = 10 * 1024 * 1024;

@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  private decodeToken(authHeader: string): {
    id_user: number;
    nama: string;
    role: string;
    id_role?: number;
  } {
    if (!authHeader) {
      throw new UnauthorizedException('Token tidak ada');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Format token tidak valid');
    }

    try {
      const payloadBase64Url = token.split('.')[1];

      const payloadJson = Buffer.from(
        payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/'),
        'base64',
      ).toString('utf-8');

      const payload = JSON.parse(payloadJson);

      return {
        id_user: payload.sub || payload.id_user || payload.id,
        nama:
          payload.nama ||
          payload.name ||
          payload.username ||
          payload.email ||
          'User',
        role:
          payload.role ||
          payload.nama_role ||
          payload.jabatan ||
          String(payload.id_role || ''),
        id_role: payload.id_role ? Number(payload.id_role) : undefined,
      };
    } catch {
      throw new UnauthorizedException('Token tidak valid');
    }
  }

  // ─── CREATE PROGRAM ──────────────────────────────────────────────────────────

  @Post()
  @UseInterceptors(
    FileInterceptor('file_mou', {
      storage: memoryStorage(),
      limits: {
        fileSize: FILE_LIMIT_10_MB,
      },
    }),
  )
  create(
    @Body() createProgramDto: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user, id_role } = this.decodeToken(authHeader);

    if (!createProgramDto.nama_program || !createProgramDto.id_sekolah) {
      throw new BadRequestException('Data wajib tidak lengkap');
    }

    return this.programService.create(createProgramDto, file, id_user, id_role);
  }

  // ─── READ PROGRAM ────────────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query('kategori') kategori?: string,
    @Query('jenis_program') jenis_program?: string,
  ) {
    return this.programService.findAll(kategori, jenis_program);
  }

  @Get('sekolah/:id_sekolah')
  findBySekolah(@Param('id_sekolah') id_sekolah: string) {
    return this.programService.findBySekolah(+id_sekolah);
  }

  @Post('reminders/run')
  runDeadlineReminders(@Query('date') date?: string) {
    return this.programService.createDeadlineReminders(date);
  }

  @Get(':id/rating-summary')
  ratingSummary(@Param('id') id: string) {
    return this.programService.getRatingSummary(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programService.findOne(+id);
  }

  // ─── UPLOAD ADMINISTRASI PEMBUKA / TERMIN ───────────────────────────────────
  // Vendor/Narasumber upload → Google Drive → WAITING_AO

  @Patch('persyaratan-termin/:id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: FILE_LIMIT_10_MB,
      },
    }),
  )
  uploadPersyaratanTermin(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user, role, id_role } = this.decodeToken(authHeader);

    return this.programService.uploadPersyaratanTermin(
      +id,
      file,
      body,
      id_user,
      role,
      id_role,
    );
  }

  // ─── AO REVIEW ADMINISTRASI PEMBUKA / TERMIN ────────────────────────────────
  // WAITING_AO → WAITING_HO / REJECTED_AO

  @Patch('persyaratan-termin/:id/ao-approve')
  aoApprovePersyaratanTermin(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user, role } = this.decodeToken(authHeader);

    return this.programService.aoApprovePersyaratanTermin(
      +id,
      id_user,
      role,
      body,
    );
  }

  @Patch('persyaratan-termin/:id/ao-reject')
  aoRejectPersyaratanTermin(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user, role } = this.decodeToken(authHeader);

    return this.programService.aoRejectPersyaratanTermin(
      +id,
      id_user,
      role,
      body,
    );
  }

  // ─── HO FINAL REVIEW ADMINISTRASI PEMBUKA / TERMIN ──────────────────────────
  // WAITING_HO → APPROVED / REJECTED_HO

  @Patch('persyaratan-termin/:id/approve')
  approvePersyaratanTermin(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user } = this.decodeToken(authHeader);

    return this.programService.approvePersyaratanTermin(+id, id_user);
  }

  @Patch('persyaratan-termin/:id/reject')
  rejectPersyaratanTermin(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user } = this.decodeToken(authHeader);

    return this.programService.rejectPersyaratanTermin(+id, id_user, body);
  }

  // ─── UPLOAD BUKTI KEGIATAN / AKTIVITAS ──────────────────────────────────────
  // Vendor/Narasumber upload → Google Drive → WAITING_AO

  @Patch('persyaratan-kegiatan/:id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: FILE_LIMIT_10_MB,
      },
    }),
  )
  uploadPersyaratanKegiatan(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user, role, id_role } = this.decodeToken(authHeader);

    return this.programService.uploadPersyaratanKegiatan(
      +id,
      file,
      body,
      id_user,
      role,
      id_role,
    );
  }

  // ─── AO REVIEW BUKTI KEGIATAN / AKTIVITAS ───────────────────────────────────
  // WAITING_AO → WAITING_HO / REJECTED_AO

  @Patch('persyaratan-kegiatan/:id/ao-approve')
  aoApprovePersyaratanKegiatan(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user, role } = this.decodeToken(authHeader);

    return this.programService.aoApprovePersyaratanKegiatan(
      +id,
      id_user,
      role,
      body,
    );
  }

  @Patch('persyaratan-kegiatan/:id/ao-reject')
  aoRejectPersyaratanKegiatan(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user, role } = this.decodeToken(authHeader);

    return this.programService.aoRejectPersyaratanKegiatan(
      +id,
      id_user,
      role,
      body,
    );
  }

  // ─── HO FINAL REVIEW BUKTI KEGIATAN / AKTIVITAS ─────────────────────────────
  // WAITING_HO → APPROVED / REJECTED_HO

  @Patch('persyaratan-kegiatan/:id/approve')
  approvePersyaratanKegiatan(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user } = this.decodeToken(authHeader);

    return this.programService.approvePersyaratanKegiatan(+id, id_user);
  }

  @Patch('persyaratan-kegiatan/:id/reject')
  rejectPersyaratanKegiatan(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user } = this.decodeToken(authHeader);

    return this.programService.rejectPersyaratanKegiatan(+id, id_user, body);
  }

  // ─── COMMENT PER KEGIATAN ───────────────────────────────────────────────────

  @Post('kegiatan/:id/comment')
  addComment(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user, nama, role } = this.decodeToken(authHeader);

    return this.programService.addComment(+id, body, id_user, nama, role);
  }

  @Get('kegiatan/:id/comments')
  getComments(@Param('id') id: string) {
    return this.programService.getCommentsByKegiatan(+id);
  }

  // ─── GURU RATING / KOMENTAR SEKOLAH ─────────────────────────────────────────

  @Post('kegiatan/:id/rating')
  submitRating(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user, nama } = this.decodeToken(authHeader);

    return this.programService.submitGuruRating(+id, body, id_user, nama);
  }

  // ─── UPDATE PROGRAM ─────────────────────────────────────────────────────────

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file_mou', {
      storage: memoryStorage(),
      limits: {
        fileSize: FILE_LIMIT_10_MB,
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateData: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authHeader: string,
  ) {
    const { id_user, id_role } = this.decodeToken(authHeader);

    return this.programService.update(+id, updateData, file, id_user, id_role);
  }
}
