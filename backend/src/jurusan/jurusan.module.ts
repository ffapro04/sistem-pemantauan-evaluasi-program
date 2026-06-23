/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Jurusan } from './entities/jurusan.entity';
import { JurusanController } from './jurusan.controller';
import { JurusanService } from './jurusan.service';
import { Sekolah } from '../sekolah/entities/sekolah.entity';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';

@Module({
  imports: [TypeOrmModule.forFeature([Jurusan, Sekolah]), NotifikasiModule],
  controllers: [JurusanController],
  providers: [JurusanService],
  exports: [JurusanService],
})
export class JurusanModule {}
