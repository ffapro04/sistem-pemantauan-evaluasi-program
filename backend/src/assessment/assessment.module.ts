/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Assessment } from './entities/assessment.entity';
import { AssessmentPertanyaan } from './entities/assessment-pertanyaan.entity';
import { AssessmentJawaban } from './entities/assessment-jawaban.entity';
import { User } from '../users/user.entity';
import { Sekolah } from '../sekolah/entities/sekolah.entity';
import { AssessmentGuru } from '../assessment-guru/entities/assessment-guru.entity'; // ← TAMBAHKAN

import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Assessment,
      AssessmentPertanyaan,
      AssessmentJawaban,
      User,
      Sekolah,
      AssessmentGuru, // ← TAMBAHKAN INI
    ]),
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
})
export class AssessmentModule {}
