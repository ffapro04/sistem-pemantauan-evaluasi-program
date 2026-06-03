/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TerminService } from './termin.service';

@Controller('termin')
export class TerminController {
  constructor(private readonly terminService: TerminService) {}

  private getUserFromAuth(authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token tidak ada');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payloadBase64Url = token.split('.')[1];
      const payloadBase64 = payloadBase64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const payloadJson = Buffer.from(payloadBase64, 'base64').toString(
        'utf-8',
      );

      const payload = JSON.parse(payloadJson);

      return {
        id_user: payload.sub || payload.id_user || payload.id,
        nama_user: payload.nama || payload.name || payload.email || '',
        role_user:
          payload.role ||
          payload.nama_role ||
          payload.jabatan ||
          String(payload.id_role || ''),
      };
    } catch (e) {
      throw new UnauthorizedException('Token tidak valid');
    }
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file_dokumentasi', {
      storage: diskStorage({
        destination: './uploads/dokumentasi',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `DOC-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  createTermin(
    @Body() createDto: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authHeader: string,
  ) {
    const user = this.getUserFromAuth(authHeader);

    return this.terminService.createTermin(
      createDto,
      file,
      user.id_user,
      user.nama_user,
      user.role_user,
    );
  }

  @Get('kegiatans/:id')
  getTerminsByKegiatans(@Param('id') id: string) {
    return this.terminService.getTerminsByKegiatans(+id);
  }

  @Post('chat')
  createChat(
    @Body() createDto: any,
    @Headers('authorization') authHeader: string,
  ) {
    const user = this.getUserFromAuth(authHeader);

    return this.terminService.createChat(
      createDto,
      user.id_user,
      user.nama_user,
      user.role_user,
    );
  }

  @Get('chat')
  getChatsByContext(@Query() query: any) {
    return this.terminService.getChatsByContext(query);
  }

  @Get('chat/:id_termin')
  getChatsByTermin(@Param('id_termin') id_termin: string) {
    return this.terminService.getChatsByTermin(+id_termin);
  }
}
