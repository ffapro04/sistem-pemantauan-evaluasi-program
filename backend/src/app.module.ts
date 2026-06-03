/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'ypamdr17',
      database: 'sistem_monitoring_evaluasi_program',
      autoLoadEntities: true,
      synchronize: true,
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
  ],
})
export class AppModule {}
