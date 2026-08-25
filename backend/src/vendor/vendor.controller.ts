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
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth-guard';

export type VendorDocumentFiles = {
  npwp_file?: Express.Multer.File[];
  buku_rekening_file?: Express.Multer.File[];
  ktp_pj_file?: Express.Multer.File[];
  akta_notaris_file?: Express.Multer.File[];
};

const vendorDocumentFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        'Dokumen vendor harus berupa PDF, JPG, JPEG, PNG, atau WEBP.',
      ),
      false,
    );
  }

  callback(null, true);
};

const vendorDocumentInterceptor = FileFieldsInterceptor(
  [
    {
      name: 'npwp_file',
      maxCount: 1,
    },
    {
      name: 'buku_rekening_file',
      maxCount: 1,
    },
    {
      name: 'ktp_pj_file',
      maxCount: 1,
    },
    {
      name: 'akta_notaris_file',
      maxCount: 1,
    },
  ],
  {
    storage: memoryStorage(),
    fileFilter: vendorDocumentFilter,
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  },
);

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  // Sumber identitas user tunggal: req.user, sudah diverifikasi tanda
  // tangannya oleh JwtStrategy (lewat JwtAuthGuard) — tidak ada lagi decode
  // token manual tanpa verifikasi di sini.
  private extractUser(req: any): {
    id_user: number | null;
    id_role: number | null;
  } {
    const user = req?.user?.user ?? req?.user;

    return {
      id_user: Number(user?.id_user || user?.sub || user?.id || 0) || null,
      id_role: user?.id_role ? Number(user.id_role) : null,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(vendorDocumentInterceptor)
  create(
    @Body() createVendorDto: CreateVendorDto,
    @UploadedFiles() files: VendorDocumentFiles,
    @Req() req: any,
  ) {
    const currentUser = this.extractUser(req);
    return this.vendorService.create(createVendorDto, files, currentUser);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.vendorService.findAll(page, limit);
  }

  @Get('management/summary')
  getManagementSummary() {
    return this.vendorService.getManagementSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(vendorDocumentInterceptor)
  update(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
    @UploadedFiles() files: VendorDocumentFiles,
    @Req() req: any,
  ) {
    const currentUser = this.extractUser(req);
    return this.vendorService.update(+id, updateVendorDto, files, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorService.remove(+id);
  }
}
