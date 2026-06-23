/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SekolahService } from './sekolah.service';
import { SekolahController } from './sekolah.controller';
import { Sekolah } from './entities/sekolah.entity';

import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { RolesModule } from '../roles/roles.module';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sekolah, User, Role]),
    RolesModule,
    NotifikasiModule,
  ],
  controllers: [SekolahController],
  providers: [SekolahService],
})
export class SekolahModule {}
