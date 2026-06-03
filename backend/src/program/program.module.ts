/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';

import { Program } from './entities/program.entity';
import { DokumenProgram } from './entities/dokumen-program.entity';
import { Fase } from './entities/fase.entity';
import { Kegiatans } from './entities/kegiatans.entity';
import { Termin } from './entities/termin.entity';
import { TerminChat } from './entities/termin-chat.entity';
import { PersyaratanTermin } from './entities/persyaratan-termin.entity';
import { PersyaratanKegiatan } from './entities/persyaratan-kegiatan.entity';

import { TerminService } from './termin.service';
import { TerminController } from './termin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Program,
      DokumenProgram,
      Fase,
      Kegiatans,
      Termin,
      TerminChat,
      PersyaratanTermin,
      PersyaratanKegiatan,
    ]),
  ],
  controllers: [ProgramController, TerminController],
  providers: [ProgramService, TerminService],
})
export class ProgramModule {}
