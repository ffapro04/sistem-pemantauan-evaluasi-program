/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth-guard';

const userPhotoStorage = diskStorage({
  destination: (_req, _file, callback) => {
    const uploadPath = './uploads/users';

    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    callback(null, uploadPath);
  },
  filename: (_req, file, callback) => {
    const extension = extname(file.originalname || '').toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    callback(null, `user-${uniqueSuffix}${extension}`);
  },
});

const userPhotoFilter = (
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
        'Foto profil harus berupa JPG, JPEG, PNG, atau WEBP.',
      ),
      false,
    );
  }

  callback(null, true);
};

const userPhotoInterceptor = FileInterceptor('foto_profile_file', {
  storage: userPhotoStorage,
  fileFilter: userPhotoFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private mergeUploadedPhoto(body: any, file?: Express.Multer.File) {
    if (!file) return body;

    return {
      ...body,
      foto_profile: file.filename,
    };
  }

  @Get('ho')
  getHoUsers() {
    return this.usersService.getUsersByRole('HO');
  }

  @Get('ao')
  getAoUsers() {
    return this.usersService.getUsersByRole('AO');
  }

  @Get('pengurus')
  getPengurusUsers() {
    return this.usersService.getUsersByRole('PENGURUS');
  }

  @Get('kepala-sekolah')
  @UseGuards(JwtAuthGuard)
  findAllKepalaSekolah(@Req() req: any) {
    const currentUser = req?.user?.user ?? req?.user;
    return this.usersService.findAllKepalaSekolah(currentUser);
  }

  @Get('kepala-sekolah/sekolah/:id_sekolah')
  @UseGuards(JwtAuthGuard)
  findKepalaSekolahBySekolah(
    @Req() req: any,
    @Param('id_sekolah', ParseIntPipe) idSekolah: number,
  ) {
    const currentUser = req?.user?.user ?? req?.user;
    return this.usersService.findKepalaSekolahBySekolah(currentUser, idSekolah);
  }

  @Post('kepala-sekolah')
  @UseGuards(JwtAuthGuard)
  createKepalaSekolah(@Req() req: any, @Body() body: any) {
    const currentUser = req?.user?.user ?? req?.user;
    return this.usersService.createKepalaSekolah(currentUser, body);
  }

  @Patch('kepala-sekolah/:id')
  @UseGuards(JwtAuthGuard)
  updateKepalaSekolah(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    const currentUser = req?.user?.user ?? req?.user;
    return this.usersService.updateKepalaSekolah(currentUser, id, body);
  }

  @Patch('kepala-sekolah/:id/reset-password')
  @UseGuards(JwtAuthGuard)
  resetPasswordKepalaSekolah(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    const currentUser = req?.user?.user ?? req?.user;
    return this.usersService.resetPasswordKepalaSekolah(currentUser, id, body);
  }

  @Post()
  @UseInterceptors(userPhotoInterceptor)
  create(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    return this.usersService.create(this.mergeUploadedPhoto(body, file));
  }

  @Post('register')
  @UseInterceptors(userPhotoInterceptor)
  register(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    return this.usersService.create(this.mergeUploadedPhoto(body, file));
  }

  @Post('register_ao')
  @UseInterceptors(userPhotoInterceptor)
  registerAO(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    return this.usersService.create({
      ...this.mergeUploadedPhoto(body, file),
      id_role: body?.id_role || 4,
      jabatan: body?.jabatan || 'Area Officer',
    });
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(userPhotoInterceptor)
  updateMyProfile(
    @Req() req: any,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const currentUser = req?.user?.user ?? req?.user;
    return this.usersService.updateOwnProfile(
      currentUser,
      this.mergeUploadedPhoto(body, file),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(userPhotoInterceptor)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.update(id, this.mergeUploadedPhoto(body, file));
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
