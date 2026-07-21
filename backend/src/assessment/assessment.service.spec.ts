/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AssessmentGuru } from '../assessment-guru/entities/assessment-guru.entity';
import { Sekolah } from '../sekolah/entities/sekolah.entity';
import { User } from '../users/user.entity';
import { AssessmentJawaban } from './entities/assessment-jawaban.entity';
import { AssessmentPertanyaan } from './entities/assessment-pertanyaan.entity';
import { Assessment } from './entities/assessment.entity';
import { AssessmentService } from './assessment.service';
import { NotifikasiService } from '../notifikasi/notifikasi.service';

describe('AssessmentService', () => {
  let service: AssessmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentService,
        {
          provide: getRepositoryToken(Assessment),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AssessmentPertanyaan),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AssessmentJawaban),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Sekolah),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AssessmentGuru),
          useValue: {},
        },
        {
          provide: NotifikasiService,
          useValue: {
            dispatchMany: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AssessmentService>(AssessmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
