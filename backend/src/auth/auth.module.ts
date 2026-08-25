/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AssessmentGuru } from '../assessment-guru/entities/assessment-guru.entity';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    NotifikasiModule,
    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        if (!jwtSecret) {
          throw new Error(
            'JWT_SECRET tidak ditemukan di environment. Set JWT_SECRET sebelum menjalankan aplikasi.',
          );
        }

        const jwtExpiresIn =
          configService.get<string>('JWT_EXPIRES_IN') || '1d';

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: jwtExpiresIn as any,
          },
        };
      },
    }),

    TypeOrmModule.forFeature([AssessmentGuru]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
