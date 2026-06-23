/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import { WilayahService } from './wilayah.service';
import { CreateWilayahDto, UpdateWilayahDto } from './dto/wilayah.dto';

@Controller('wilayah')
export class WilayahController {
  constructor(private readonly wilayahService: WilayahService) {}

  // =========================
  // STATIC / REFERENCE ROUTES
  // =========================
  // Harus di atas @Get(':id') agar tidak dianggap sebagai id.

  @Get('reference/provinsi')
  getReferenceProvinsi() {
    return this.wilayahService.getProvinceReferences();
  }

  @Get('check-name')
  async checkName(
    @Query('nama') nama: string,
    @Query('excludeId') excludeId?: string,
  ) {
    try {
      if (!nama) {
        return { isDuplicate: false };
      }

      const isDuplicate = await this.wilayahService.checkDuplicateName(
        nama,
        excludeId ? Number(excludeId) : undefined,
      );

      return { isDuplicate };
    } catch (error) {
      console.error('Error di check-name:', error);
      throw new InternalServerErrorException('Gagal mengecek nama wilayah');
    }
  }

  @Get('tree')
  getWilayahTree() {
    return this.wilayahService.getWilayahTree();
  }

  @Get('provinsi')
  getProvinsi() {
    return this.wilayahService.getProvinsi();
  }

  @Get('provinsi/:id/kota')
  getKotaByProvinsi(@Param('id') id: string) {
    return this.wilayahService.getKabupatenReferenceByWilayahId(Number(id));
  }

  @Get(':id/kabupaten')
  getKabupatenByWilayah(@Param('id') id: string) {
    return this.wilayahService.getKabupatenReferenceByWilayahId(Number(id));
  }

  // =========================
  // GENERAL CRUD ROUTES
  // =========================

  @Get()
  async findAll(@Query('parentId') parentId?: string) {
    // Untuk kompatibilitas frontend lama yang masih request:
    // GET /wilayah?parentId=1
    // Sekarang diarahkan ke referensi kabupaten/kota, bukan fake row database.
    if (parentId) {
      return this.wilayahService.getKabupatenReferenceByWilayahId(
        Number(parentId),
      );
    }

    return this.wilayahService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wilayahService.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateWilayahDto) {
    return this.wilayahService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWilayahDto) {
    return this.wilayahService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wilayahService.remove(Number(id));
  }
}
