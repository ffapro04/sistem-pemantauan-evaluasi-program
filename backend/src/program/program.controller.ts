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
import { CreateProgramDto } from './dto/create-program.dto';

@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file_mou', {
      storage: diskStorage({
        destination: './uploads/mou',
        filename: (req, file, cb) => {
          // LOG 1: Cek apakah file benar-benar masuk ke Multer
          console.log('--- Multer: Memproses File ---');
          console.log('Original Name:', file.originalname);

          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `MOU-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Body() createProgramDto: CreateProgramDto,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authHeader: string,
  ) {
    // LOG 2: Cek data body dan file setelah melewati Interceptor
    console.log('--- Controller: Request Masuk ---');
    console.log('Body Data:', createProgramDto);
    console.log('File Terdeteksi:', file ? file.filename : 'TIDAK ADA FILE!');

    if (!authHeader) {
      console.error('Error: Authorization Header tidak ditemukan');
      throw new UnauthorizedException('Token tidak ada');
    }

    const token = authHeader.split(' ')[1];
    let id_user = null;

    try {
      const payloadBase64Url = token.split('.')[1];
      const payloadBase64 = payloadBase64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString(
        'utf-8',
      );
      id_user = JSON.parse(payloadJson).sub;

      console.log('User ID dari Token:', id_user);
    } catch (e) {
      console.error('Error: Gagal decode token', e.message);
      throw new UnauthorizedException('Token tidak valid');
    }

    // LOG 3: Pastikan semua data wajib ada sebelum ke Service
    if (!createProgramDto.nama_program || !createProgramDto.id_sekolah) {
      console.error('Error: Data wajib (nama_program/id_sekolah) kosong!');
      throw new BadRequestException('Data wajib tidak lengkap');
    }

    return this.programService.create(createProgramDto, file, id_user);
  }

  @Get()
  findAll(@Query('kategori') kategori?: string) {
    return this.programService.findAll(kategori);
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
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `MOU-EDIT-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateData: any,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authHeader: string,
  ) {
    console.log(`--- [DEBUG] Update Request Masuk ID: ${id} ---`);
    
    if (!authHeader) throw new UnauthorizedException('Token tidak ada');

    // Ambil ID User dari Token
    const token = authHeader.split(' ')[1];
    let id_user = null;
    try {
      const payloadBase64Url = token.split('.')[1];
      const payloadJson = Buffer.from(
        payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/'),
        'base64',
      ).toString('utf-8');
      id_user = JSON.parse(payloadJson).sub;
    } catch (e) {
      throw new UnauthorizedException('Token tidak valid');
    }

    // Panggil Service Update
    return this.programService.update(+id, updateData, file, id_user);
  }
}

  // @Patch(':id')
  // @UseInterceptors(
  //   FileInterceptor('file_mou', {
  //     storage: diskStorage({
  //       destination: './uploads/mou',
  //       filename: (req, file, cb) => {
  //         const uniqueSuffix =
  //           Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         cb(null, `MOU-EDIT-${uniqueSuffix}${extname(file.originalname)}`);
  //       },
  //     }),
  //   }),
  // )
  // update(
  //   @Param('id') id: string,
  //   @Body() updateData: any,
  //   @UploadedFile() file: Express.Multer.File,
  //   @Headers('authorization') authHeader: string,
  // ) {
  //   console.log(`--- Controller: Update Program ID ${id} ---`);
  //   console.log('Update Data:', updateData);

  //   if (!authHeader) throw new UnauthorizedException('Token tidak ada');

  //   const token = authHeader.split(' ')[1];
  //   let id_user = null;
  //   try {
  //     const payloadBase64Url = token.split('.')[1];
  //     const payloadJson = Buffer.from(
  //       payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/'),
  //       'base64',
  //     ).toString('utf-8');
  //     id_user = JSON.parse(payloadJson).sub;
  //   } catch (e) {
  //     throw new UnauthorizedException('Token tidak valid');
  //   }

  //   return this.programService.update(+id, updateData, file, id_user);
  // }

