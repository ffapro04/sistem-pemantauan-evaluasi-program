/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { SekolahService } from './sekolah.service';

const sekolahLogoStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/sekolah';

    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = extname(file.originalname);
    cb(null, `logo-sekolah-${uniqueSuffix}${fileExt}`);
  },
});

const sekolahLogoFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        'File logo harus berupa gambar JPG, JPEG, PNG, atau WEBP.',
      ),
      false,
    );
  }

  cb(null, true);
};

@Controller('sekolah')
export class SekolahController {
  constructor(private readonly sekolahService: SekolahService) {}

  @Patch('operator/jumlah-siswa')
  @UseGuards(AuthGuard('jwt'))
  updateJumlahSiswaOperator(@Req() req: any, @Body() body: any) {
    const currentUser = req?.user?.user ?? req?.user;

    return this.sekolahService.updateJumlahSiswaOperator(
      currentUser?.id_sekolah,
      body?.jumlah_siswa,
    );
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: sekolahLogoStorage,
      fileFilter: sekolahLogoFilter,
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async create(
    @Body() createSekolahDto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (createSekolahDto.id_wilayah && !createSekolahDto.id_kabupaten) {
      createSekolahDto.id_kabupaten = Number(createSekolahDto.id_wilayah);
    }

    return this.sekolahService.create(createSekolahDto, file);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.sekolahService.findAll(page, limit);
  }

  @Get(':id(\\d+)')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sekolahService.findOne(id);
  }

  @Patch(':id(\\d+)/statistik')
  updateStatistikSekolah(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.sekolahService.updateStatistikSekolah(id, body);
  }

  @Patch(':id(\\d+)')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: sekolahLogoStorage,
      fileFilter: sekolahLogoFilter,
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSekolahDto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (updateSekolahDto.id_wilayah && !updateSekolahDto.id_kabupaten) {
      updateSekolahDto.id_kabupaten = Number(updateSekolahDto.id_wilayah);
    }

    return this.sekolahService.update(id, updateSekolahDto, file);
  }

  @Delete(':id(\\d+)')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sekolahService.remove(id);
  }
}
