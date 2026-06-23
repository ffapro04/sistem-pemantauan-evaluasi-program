/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssessmentGuru } from './entities/assessment-guru.entity';
import { AssessmentGuruController } from './assessment-guru.controller';
import { AssessmentGuruService } from './assessment-guru.service';
import { Sekolah } from '../sekolah/entities/sekolah.entity';
import { Kelas } from '../kelas/entities/kelas.entity';
import { Jurusan } from '../jurusan/entities/jurusan.entity';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssessmentGuru, Sekolah, Kelas, Jurusan]),
    NotifikasiModule,
  ],
  controllers: [AssessmentGuruController],
  providers: [AssessmentGuruService],
  exports: [AssessmentGuruService],
})
export class AssessmentGuruModule {}
