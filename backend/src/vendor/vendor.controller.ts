/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

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

  private decodeToken(authHeader?: string): {
    id_user: number | null;
    id_role: number | null;
  } {
    if (!authHeader) {
      return {
        id_user: null,
        id_role: null,
      };
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Format token tidak valid');
    }

    try {
      const payloadJson = Buffer.from(
        token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'),
        'base64',
      ).toString('utf-8');

      const payload = JSON.parse(payloadJson);

      return {
        id_user: Number(payload.sub || payload.id_user || payload.id || 0) || null,
        id_role: payload.id_role ? Number(payload.id_role) : null,
      };
    } catch {
      throw new UnauthorizedException('Token tidak valid');
    }
  }

  @Post()
  @UseInterceptors(vendorDocumentInterceptor)
  create(
    @Body() createVendorDto: CreateVendorDto,
    @UploadedFiles() files: VendorDocumentFiles,
    @Headers('authorization') authHeader?: string,
  ) {
    const currentUser = this.decodeToken(authHeader);
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
  @UseInterceptors(vendorDocumentInterceptor)
  update(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
    @UploadedFiles() files: VendorDocumentFiles,
    @Headers('authorization') authHeader?: string,
  ) {
    const currentUser = this.decodeToken(authHeader);
    return this.vendorService.update(+id, updateVendorDto, files, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorService.remove(+id);
  }
}
