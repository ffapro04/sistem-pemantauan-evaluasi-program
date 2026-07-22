/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AssessmentGuru } from '../assessment-guru/entities/assessment-guru.entity';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(AssessmentGuru),
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: NotifikasiService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
