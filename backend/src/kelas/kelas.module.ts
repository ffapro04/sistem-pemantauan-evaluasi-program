/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Kelas } from './entities/kelas.entity';
import { KelasController } from './kelas.controller';
import { KelasService } from './kelas.service';
import { Sekolah } from '../sekolah/entities/sekolah.entity';
import { Jurusan } from '../jurusan/entities/jurusan.entity';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kelas, Sekolah, Jurusan]),
    NotifikasiModule,
  ],
  controllers: [KelasController],
  providers: [KelasService],
  exports: [KelasService],
})
export class KelasModule {}
