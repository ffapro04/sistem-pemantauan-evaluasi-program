/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';

import { JurusanService } from './jurusan.service';
import { CreateJurusanDto } from './dto/create-jurusan.dto';
import { UpdateJurusanDto } from './dto/update-jurusan.dto';

const jurusanImageStorage = diskStorage({
  destination: (_req, _file, callback) => {
    const uploadPath = './uploads/jurusan';

    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    callback(null, uploadPath);
  },
  filename: (_req, file, callback) => {
    const extension = extname(file.originalname || '').toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    callback(null, `jurusan-${uniqueSuffix}${extension}`);
  },
});

const jurusanImageFilter = (
  _req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        'Gambar jurusan harus berupa JPG, JPEG, PNG, atau WEBP.',
      ),
      false,
    );
  }

  callback(null, true);
};

const jurusanImageInterceptor = FileInterceptor('gambar_jurusan_file', {
  storage: jurusanImageStorage,
  fileFilter: jurusanImageFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
});

@Controller('jurusan')
export class JurusanController {
  constructor(private readonly jurusanService: JurusanService) {}

  private mergeUploadedImage(body: any, file?: Express.Multer.File) {
    if (!file) return body;

    return {
      ...body,
      gambar_jurusan: file.filename,
    };
  }

  @Get('sekolah/:id_sekolah')
  findBySekolah(@Param('id_sekolah') id_sekolah: string) {
    return this.jurusanService.findBySekolah(Number(id_sekolah));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jurusanService.findOne(Number(id));
  }

  @Post()
  @UseInterceptors(jurusanImageInterceptor)
  create(
    @Body() dto: CreateJurusanDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.jurusanService.create(this.mergeUploadedImage(dto, file));
  }

  @Patch(':id')
  @UseInterceptors(jurusanImageInterceptor)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJurusanDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.jurusanService.update(Number(id), this.mergeUploadedImage(dto, file));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jurusanService.remove(Number(id));
  }
}
