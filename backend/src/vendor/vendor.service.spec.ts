import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { UsersService } from '../users/users.service';
import { Vendor } from './entities/vendor.entity';
import { VendorService } from './vendor.service';

describe('VendorService', () => {
  let service: VendorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorService,
        {
          provide: getRepositoryToken(Vendor),
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: GoogleDriveService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<VendorService>(VendorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
