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

import { JurusanService } from './jurusan.service';
import { CreateJurusanDto } from './dto/create-jurusan.dto';
import { UpdateJurusanDto } from './dto/update-jurusan.dto';

@Controller('jurusan')
export class JurusanController {
  constructor(private readonly jurusanService: JurusanService) {}

  @Get('sekolah/:id_sekolah')
  findBySekolah(@Param('id_sekolah') id_sekolah: string) {
    return this.jurusanService.findBySekolah(Number(id_sekolah));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jurusanService.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateJurusanDto) {
    return this.jurusanService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateJurusanDto) {
    return this.jurusanService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jurusanService.remove(Number(id));
  }
}
