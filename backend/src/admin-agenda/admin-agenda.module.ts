/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentGuru } from '../assessment-guru/entities/assessment-guru.entity';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';
import { User } from '../users/user.entity';
import { Wilayah } from '../wilayah/entities/wilayah.entity';
import { AdminAgendaController } from './admin-agenda.controller';
import { AdminAgendaService } from './admin-agenda.service';
import { AdminAgenda } from './entities/admin-agenda.entity';
import { AdminAgendaParticipant } from './entities/admin-agenda-participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminAgenda,
      AdminAgendaParticipant,
      User,
      AssessmentGuru,
      Wilayah,
    ]),
    NotifikasiModule,
  ],
  controllers: [AdminAgendaController],
  providers: [AdminAgendaService],
  exports: [AdminAgendaService],
})
export class AdminAgendaModule {}
