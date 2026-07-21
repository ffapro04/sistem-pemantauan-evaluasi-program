/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notifikasi } from './entities/notifikasi.entity';
import { NotifikasiController } from './notifikasi.controller';
import { NotifikasiService } from './notifikasi.service';
import { EmailService } from '../auth/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notifikasi])],
  controllers: [NotifikasiController],
  providers: [NotifikasiService, EmailService],
  exports: [NotifikasiService],
})
export class NotifikasiModule {}
