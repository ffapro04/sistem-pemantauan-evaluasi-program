/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { KelasService } from './kelas.service';
import { CreateKelasDto } from './dto/create-kelas.dto';
import { UpdateKelasDto } from './dto/update-kelas.dto';

@Controller('kelas')
export class KelasController {
  constructor(private readonly kelasService: KelasService) {}

  @Get('sekolah/:id_sekolah')
  findBySekolah(@Param('id_sekolah') id_sekolah: string) {
    return this.kelasService.findBySekolah(Number(id_sekolah));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kelasService.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateKelasDto) {
    return this.kelasService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateKelasDto) {
    return this.kelasService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kelasService.remove(Number(id));
  }
}
