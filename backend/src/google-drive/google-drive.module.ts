/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GoogleDriveController } from './google-drive.controller';
import { GoogleDriveService } from './google-drive.service';

import { UserGoogleDriveToken } from './entities/user-google-drive-token.entity';
import { GoogleDriveFile } from './entities/google-drive-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserGoogleDriveToken, GoogleDriveFile])],
  controllers: [GoogleDriveController],
  providers: [GoogleDriveService],
  exports: [GoogleDriveService],
})
export class GoogleDriveModule {}
