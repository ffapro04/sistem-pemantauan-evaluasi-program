/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Wilayah } from '../wilayah/entities/wilayah.entity';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Wilayah]), NotifikasiModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
