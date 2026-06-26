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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';

import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

export type VendorDocumentFiles = {
  npwp_file?: Express.Multer.File[];
  buku_rekening_file?: Express.Multer.File[];
  ktp_pj_file?: Express.Multer.File[];
  akta_notaris_file?: Express.Multer.File[];
};

const vendorUploadPath = './uploads/vendor';

const ensureVendorUploadDirectory = () => {
  if (!existsSync(vendorUploadPath)) {
    mkdirSync(vendorUploadPath, {
      recursive: true,
    });
  }
};

const getDocumentPrefix = (fieldName: string) => {
  if (fieldName === 'npwp_file') {
    return 'NPWP';
  }

  if (fieldName === 'buku_rekening_file') {
    return 'BUKU-REKENING';
  }

  if (fieldName === 'ktp_pj_file') {
    return 'KTP-PJ';
  }

  if (fieldName === 'akta_notaris_file') {
    return 'AKTA-NOTARIS';
  }

  return 'DOKUMEN-VENDOR';
};

const vendorDocumentStorage = diskStorage({
  destination: (req, file, callback) => {
    ensureVendorUploadDirectory();

    callback(null, vendorUploadPath);
  },

  filename: (req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    const prefix = getDocumentPrefix(file.fieldname);

    callback(null, `${prefix}-${uniqueSuffix}${extension}`);
  },
});

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
    storage: vendorDocumentStorage,
    fileFilter: vendorDocumentFilter,
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  },
);

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @UseInterceptors(vendorDocumentInterceptor)
  create(
    @Body() createVendorDto: CreateVendorDto,
    @UploadedFiles() files: VendorDocumentFiles,
  ) {
    return this.vendorService.create(createVendorDto, files);
  }

  @Get()
  findAll() {
    return this.vendorService.findAll();
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
  ) {
    return this.vendorService.update(+id, updateVendorDto, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorService.remove(+id);
  }
}
