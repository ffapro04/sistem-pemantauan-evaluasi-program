/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { Sekolah } from './entities/sekolah.entity';
import { SekolahService } from './sekolah.service';

describe('SekolahService', () => {
  let service: SekolahService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SekolahService,
        {
          provide: getRepositoryToken(Sekolah),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: NotifikasiService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SekolahService>(SekolahService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
