/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sekolahService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSekolahDto: UpdateSekolahDto) {
    return this.sekolahService.update(+id, updateSekolahDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sekolahService.remove(+id);
  }
  
}
