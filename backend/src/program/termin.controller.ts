/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth-guard';
import { TerminService } from './termin.service';

const FILE_LIMIT_10_MB = 10 * 1024 * 1024;

@Controller('termin')
@UseGuards(JwtAuthGuard)
export class TerminController {
  constructor(private readonly terminService: TerminService) {}

  private getUserFromRequest(request: any) {
    const payload = request?.user || {};
    const idUser =
      payload.id_user ||
      payload.sub ||
      payload.id ||
      payload.userId ||
      payload.id_guru_assessment;

    if (!idUser) {
      throw new UnauthorizedException('Token tidak valid');
    }

    return {
      id_user: Number(idUser),
      id_role: payload.id_role ? Number(payload.id_role) : null,
      id_sekolah: payload.id_sekolah ? Number(payload.id_sekolah) : null,
      nama_user: payload.nama || payload.name || payload.email || '',
      role_user:
        payload.role ||
        payload.nama_role ||
        payload.jabatan ||
        String(payload.id_role || ''),
    };
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file_dokumentasi', {
      storage: memoryStorage(),
      limits: {
        fileSize: FILE_LIMIT_10_MB,
      },
    }),
  )
  createTermin(
    @Body() createDto: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: any,
  ) {
    const user = this.getUserFromRequest(request);

    return this.terminService.createTermin(
      createDto,
      file,
      user.id_user,
      user.nama_user,
      user.role_user,
      user.id_role,
    );
  }

  @Get('kegiatans/:id')
  getTerminsByKegiatans(@Param('id') id: string) {
    return this.terminService.getTerminsByKegiatans(+id);
  }

  @Post('chat')
  createChat(
    @Body() createDto: any,
    @Req() request: any,
  ) {
    const user = this.getUserFromRequest(request);

    return this.terminService.createChat(
      createDto,
      user.id_user,
      user.nama_user,
      user.role_user,
      user,
    );
  }

  @Get('chat')
  getChatsByContext(@Query() query: any, @Req() request: any) {
    const user = this.getUserFromRequest(request);

    return this.terminService.getChatsByContext(query, user);
  }

  @Get('chat/:id_termin')
  getChatsByTermin(
    @Param('id_termin') id_termin: string,
    @Req() request: any,
  ) {
    const user = this.getUserFromRequest(request);

    return this.terminService.getChatsByTermin(+id_termin, user);
  }
}
