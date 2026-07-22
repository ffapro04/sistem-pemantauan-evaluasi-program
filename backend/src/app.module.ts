/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AssessmentModule } from './assessment/assessment.module';
import { SekolahModule } from './sekolah/sekolah.module';
import { WilayahModule } from './wilayah/wilayah.module';
import { ProgramModule } from './program/program.module';
import { VendorModule } from './vendor/vendor.module';
import { AssessmentGuruModule } from './assessment-guru/assessment-guru.module';
import { NotifikasiModule } from './notifikasi/notifikasi.module';
import { KelasModule } from './kelas/kelas.module';
import { JurusanModule } from './jurusan/jurusan.module';
import { AdminAgendaModule } from './admin-agenda/admin-agenda.module';
import { GoogleDriveModule } from './google-drive/google-drive.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'gesa123',
      database: process.env.DB_DATABASE || 'postgres',
      autoLoadEntities: true,
      synchronize: false,
    }),

    AuthModule,
    UsersModule,
    RolesModule,
    AssessmentModule,
    SekolahModule,
    WilayahModule,
    ProgramModule,
    VendorModule,
    AssessmentGuruModule,
    NotifikasiModule,
    KelasModule,
    JurusanModule,
    AdminAgendaModule,
    GoogleDriveModule,
    UploadsModule,
  ],
})
export class AppModule {}
