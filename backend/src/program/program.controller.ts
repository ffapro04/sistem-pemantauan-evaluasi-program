/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProgramService } from './program.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth-guard';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

const FILE_LIMIT_10_MB = 10 * 1024 * 1024;

@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  // Sumber identitas user tunggal untuk seluruh controller ini: req.user
  // sudah diverifikasi tanda tangannya oleh JwtStrategy (lewat JwtAuthGuard),
  // jadi tidak ada lagi decode token manual tanpa verifikasi di sini.
  private extractUser(req: any): {
    id_user: number;
    nama: string;
    role: string;
    id_role?: number;
  } {
    const user = req?.user?.user ?? req?.user;

    return {
      id_user: Number(user?.id_user || user?.sub || user?.id || 0),
      nama: user?.nama || user?.name || user?.email || 'User',
      role: user?.role || user?.nama_role || String(user?.id_role || ''),
      id_role: user?.id_role ? Number(user.id_role) : undefined,
    };
  }

  // ─── CREATE PROGRAM ──────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file_mou', {
      storage: memoryStorage(),
      limits: {
        fileSize: FILE_LIMIT_10_MB,
      },
    }),
  )
  create(
    @Body() createProgramDto: CreateProgramDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const { id_user, id_role } = this.extractUser(req);

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
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('include') include?: string,
  ) {
    return this.programService.findAll(
      kategori,
      jenis_program,
      page,
      limit,
      include,
    );
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
  @UseGuards(JwtAuthGuard)
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
    @Req() req: any,
  ) {
    const { id_user, role, id_role } = this.extractUser(req);

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
  @UseGuards(JwtAuthGuard)
  aoApprovePersyaratanTermin(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const { id_user, role } = this.extractUser(req);

    return this.programService.aoApprovePersyaratanTermin(
      +id,
      id_user,
      role,
      body,
    );
  }

  @Patch('persyaratan-termin/:id/ao-reject')
  @UseGuards(JwtAuthGuard)
  aoRejectPersyaratanTermin(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const { id_user, role } = this.extractUser(req);

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
  @UseGuards(JwtAuthGuard)
  approvePersyaratanTermin(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const { id_user, role } = this.extractUser(req);

    return this.programService.approvePersyaratanTermin(+id, id_user, role);
  }

  @Patch('persyaratan-termin/:id/reject')
  @UseGuards(JwtAuthGuard)
  rejectPersyaratanTermin(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const { id_user, role } = this.extractUser(req);

    return this.programService.rejectPersyaratanTermin(+id, id_user, role, body);
  }

  // ─── UPLOAD BUKTI KEGIATAN / AKTIVITAS ──────────────────────────────────────
  // Vendor/Narasumber upload → Google Drive → WAITING_AO

  @Patch('persyaratan-kegiatan/:id/upload')
  @UseGuards(JwtAuthGuard)
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
    @Req() req: any,
  ) {
    const { id_user, role, id_role } = this.extractUser(req);

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
  @UseGuards(JwtAuthGuard)
  aoApprovePersyaratanKegiatan(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const { id_user, role } = this.extractUser(req);

    return this.programService.aoApprovePersyaratanKegiatan(
      +id,
      id_user,
      role,
      body,
    );
  }

  @Patch('persyaratan-kegiatan/:id/ao-reject')
  @UseGuards(JwtAuthGuard)
  aoRejectPersyaratanKegiatan(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const { id_user, role } = this.extractUser(req);

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
  @UseGuards(JwtAuthGuard)
  approvePersyaratanKegiatan(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const { id_user, role } = this.extractUser(req);

    return this.programService.approvePersyaratanKegiatan(+id, id_user, role);
  }

  @Patch('persyaratan-kegiatan/:id/reject')
  @UseGuards(JwtAuthGuard)
  rejectPersyaratanKegiatan(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const { id_user, role } = this.extractUser(req);

    return this.programService.rejectPersyaratanKegiatan(+id, id_user, role, body);
  }

  // ─── COMMENT PER KEGIATAN ───────────────────────────────────────────────────

  @Post('kegiatan/:id/comment')
  @UseGuards(JwtAuthGuard)
  addComment(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const { id_user, nama, role } = this.extractUser(req);

    return this.programService.addComment(+id, body, id_user, nama, role);
  }

  @Get('kegiatan/:id/comments')
  getComments(@Param('id') id: string) {
    return this.programService.getCommentsByKegiatan(+id);
  }

  // ─── GURU RATING / KOMENTAR SEKOLAH ─────────────────────────────────────────

  @Post('kegiatan/:id/rating')
  @UseGuards(JwtAuthGuard)
  submitRating(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const { id_user, nama } = this.extractUser(req);

    return this.programService.submitGuruRating(+id, body, id_user, nama);
  }

  // ─── UPDATE PROGRAM ─────────────────────────────────────────────────────────

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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
    @Body() updateData: UpdateProgramDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const { id_user, id_role } = this.extractUser(req);

    return this.programService.update(+id, updateData, file, id_user, id_role);
  }
}
