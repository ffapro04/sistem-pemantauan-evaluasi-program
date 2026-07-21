import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { DokumenProgram } from './entities/dokumen-program.entity';
import { Fase } from './entities/fase.entity';
import { KegiatanComment } from './entities/kegiatan-comment.entity';
import { KegiatanPertemuan } from './entities/kegiatan-pertemuan.entity';
import { KegiatanRating } from './entities/kegiatan-rating.entity';
import { Kegiatans } from './entities/kegiatans.entity';
import { PersyaratanKegiatan } from './entities/persyaratan-kegiatan.entity';
import { PersyaratanTermin } from './entities/persyaratan-termin.entity';
import { Program } from './entities/program.entity';
import { Termin } from './entities/termin.entity';
import { ProgramService } from './program.service';

describe('ProgramService', () => {
  let service: ProgramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramService,
        {
          provide: getRepositoryToken(Program),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Fase),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Kegiatans),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Termin),
          useValue: {},
        },
        {
          provide: getRepositoryToken(PersyaratanTermin),
          useValue: {},
        },
        {
          provide: getRepositoryToken(PersyaratanKegiatan),
          useValue: {},
        },
        {
          provide: getRepositoryToken(DokumenProgram),
          useValue: {},
        },
        {
          provide: getRepositoryToken(KegiatanComment),
          useValue: {},
        },
        {
          provide: getRepositoryToken(KegiatanPertemuan),
          useValue: {},
        },
        {
          provide: getRepositoryToken(KegiatanRating),
          useValue: {},
        },
        {
          provide: GoogleDriveService,
          useValue: {},
        },
        {
          provide: NotifikasiService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProgramService>(ProgramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
