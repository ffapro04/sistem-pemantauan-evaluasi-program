/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SekolahService } from './sekolah.service';
import { CreateSekolahDto } from './dto/create-sekolah.dto';
import { UpdateSekolahDto } from './dto/update-sekolah.dto';

@Controller('sekolah')
export class SekolahController {
  constructor(private readonly sekolahService: SekolahService) {}

  @Post()
  create(@Body() createSekolahDto: CreateSekolahDto) {
    return this.sekolahService.create(createSekolahDto);
  }

  @Get()
  findAll() {
    return this.sekolahService.findAll();
  }

  // --- POSISI PENTING: Jalur 'user/:userId' harus di atas ':id' jika id-nya string, 
  // tapi karena kita pakai ParseIntPipe, urutan ini sudah aman. ---
  // @Get('user/:userId')
  // findByUserId(@Param('userId', ParseIntPipe) userId: number) {
  //   return this.sekolahService.findByUserId(userId);
  // }
@Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    
    return await this.sekolahService.findByUserId(+userId);
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.sekolahService.findOne(+id);
  }
@Get('programs/user/:userId')
async findPrograms(@Param('userId', ParseIntPipe) userId: number) {
  return this.sekolahService.findProgramsByUserId(userId);
}

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSekolahDto: UpdateSekolahDto) {
    return this.sekolahService.update(id, updateSekolahDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sekolahService.remove(id);
  }
}