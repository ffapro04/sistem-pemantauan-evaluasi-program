/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { User } from '../users/user.entity'; // tambah import ini
import { UsersModule } from '../users/users.module';
import { GoogleDriveModule } from '../google-drive/google-drive.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor, User]), // tambah User di sini
    UsersModule,
    GoogleDriveModule,
  ],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}
