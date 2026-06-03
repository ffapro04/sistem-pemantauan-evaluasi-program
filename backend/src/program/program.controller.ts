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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProgramService } from './program.service';

function buildFilename(prefix: string, originalname: string) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return `${prefix}-${uniqueSuffix}${extname(originalname)}`;
}

@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  private getUserIdFromAuth(authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token tidak ada');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payloadBase64Url = token.split('.')[1];

      const payloadJson = Buffer.from(
        payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/'),
        'base64',
      ).toString('utf-8');

      const payload = JSON.parse(payloadJson);

      return payload.sub || payload.id_user || payload.id;
    } catch (e) {
      throw new UnauthorizedException('Token tidak valid');
    }
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file_mou', {
      storage: diskStorage({
        destination: './uploads/mou',
        filename: (req, file, cb) => {
          console.log('--- Multer: Memproses File ---');
          console.log('Original Name:', file.originalname);

          cb(null, buildFilename('MOU', file.originalname));
        },
      }),
    }),
  )
  create(
    @Body() createProgramDto: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('--- Controller: Request Masuk ---');
    console.log('Body Data:', createProgramDto);
    console.log('BODY FASES:', createProgramDto.fases);
    console.log('BODY FASES TYPE:', typeof createProgramDto.fases);
    console.log('File Terdeteksi:', file ? file.filename : 'TIDAK ADA FILE!');

    const id_user = this.getUserIdFromAuth(authHeader);

    if (!createProgramDto.nama_program || !createProgramDto.id_sekolah) {
      console.error('Error: Data wajib nama_program/id_sekolah kosong');
      throw new BadRequestException('Data wajib tidak lengkap');
    }

    return this.programService.create(createProgramDto, file, id_user);
  }

  @Get()
  findAll(@Query('kategori') kategori?: string) {
    return this.programService.findAll(kategori);
  }

  @Patch('persyaratan-termin/:id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/dokumentasi',
        filename: (req, file, cb) => {
          cb(null, buildFilename('REQ-TERMIN', file.originalname));
        },
      }),
    }),
  )
  uploadPersyaratanTermin(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authHeader: string,
  ) {
    const id_user = this.getUserIdFromAuth(authHeader);

    return this.programService.uploadPersyaratanTermin(
      +id,
      file,
      body,
      id_user,
    );
  }

  @Patch('persyaratan-kegiatan/:id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/dokumentasi',
        filename: (req, file, cb) => {
          cb(null, buildFilename('REQ-KEGIATAN', file.originalname));
        },
      }),
    }),
  )
  uploadPersyaratanKegiatan(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authHeader: string,
  ) {
    const id_user = this.getUserIdFromAuth(authHeader);

    return this.programService.uploadPersyaratanKegiatan(
      +id,
      file,
      body,
      id_user,
    );
  }

  @Patch('persyaratan-termin/:id/approve')
  approvePersyaratanTermin(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    const id_user = this.getUserIdFromAuth(authHeader);

    return this.programService.approvePersyaratanTermin(+id, id_user);
  }

  @Patch('persyaratan-termin/:id/reject')
  rejectPersyaratanTermin(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const id_user = this.getUserIdFromAuth(authHeader);

    return this.programService.rejectPersyaratanTermin(+id, id_user, body);
  }

  @Patch('persyaratan-kegiatan/:id/approve')
  approvePersyaratanKegiatan(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    const id_user = this.getUserIdFromAuth(authHeader);

    return this.programService.approvePersyaratanKegiatan(+id, id_user);
  }

  @Patch('persyaratan-kegiatan/:id/reject')
  rejectPersyaratanKegiatan(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const id_user = this.getUserIdFromAuth(authHeader);

    return this.programService.rejectPersyaratanKegiatan(+id, id_user, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file_mou', {
      storage: diskStorage({
        destination: './uploads/mou',
        filename: (req, file, cb) => {
          cb(null, buildFilename('MOU-EDIT', file.originalname));
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateData: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authHeader: string,
  ) {
    console.log(`--- Controller: Update Program ID ${id} ---`);
    console.log('Update Data:', updateData);

    const id_user = this.getUserIdFromAuth(authHeader);

    return this.programService.update(+id, updateData, file, id_user);
  }
}
