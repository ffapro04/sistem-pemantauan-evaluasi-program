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

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret =
          configService.get<string>('JWT_SECRET') ||
          process.env.JWT_SECRET ||
          'SECRET_KEY';

        const jwtExpiresIn =
          configService.get<string>('JWT_EXPIRES_IN') ||
          process.env.JWT_EXPIRES_IN ||
          '1d';

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
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
