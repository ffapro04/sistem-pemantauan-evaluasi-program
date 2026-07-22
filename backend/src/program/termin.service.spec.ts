import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { TerminService } from './termin.service';

describe('TerminService live chat access', () => {
  const makeService = (overrides: any = {}) => {
    const manager = {
      query: jest.fn(async (sql: string) => {
        if (sql.includes('FROM t_fase')) {
          return [{ id_program: overrides.faseProgramId ?? 1 }];
        }

        return [];
      }),
    };

    const programRepo = {
      manager,
      findOne: jest.fn(async () => ({
        id_program: 1,
        id_sekolah: 151,
        sekolah_ids: [151],
        id_vendor: [10],
        vendor_ids: [10],
      })),
    };

    const terminRepo = {};
    const chatRepo = {
      create: jest.fn((payload) => payload),
      save: jest.fn(async (payload) => ({ id_chat: 1, ...payload })),
      find: jest.fn(async () => []),
      createQueryBuilder: jest.fn(() => ({
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(async () => []),
      })),
    };
    const vendorRepo = {
      findOne: jest.fn(async () => ({ id_vendor: overrides.vendorId ?? 10 })),
    };
    const googleDriveService = {
      getStatus: jest.fn(),
      uploadFile: jest.fn(),
    };

    const service = new TerminService(
      programRepo as any,
      terminRepo as any,
      chatRepo as any,
      vendorRepo as any,
      googleDriveService as any,
    );

    return { service, programRepo, chatRepo, vendorRepo, manager };
  };

  it('allows elevated monitoring users to send chat in a valid program context', async () => {
    const { service, chatRepo } = makeService();

    await expect(
      service.createChat(
        { id_program: 1, pesan: 'Halo' },
        3,
        'Head Office',
        'Head Office',
        { id_user: 3, id_role: 3 },
      ),
    ).resolves.toMatchObject({ pesan: 'Halo', id_program: 1 });

    expect(chatRepo.save).toHaveBeenCalledTimes(1);
  });

  it('allows related vendors to send chat', async () => {
    const { service, chatRepo } = makeService({ vendorId: 10 });

    await service.createChat(
      { id_program: 1, pesan: 'Upload sudah dikirim' },
      6,
      'Vendor',
      'Vendor',
      { id_user: 6, id_role: 6 },
    );

    expect(chatRepo.save).toHaveBeenCalledTimes(1);
  });

  it('rejects vendors that are not assigned to the program', async () => {
    const { service } = makeService({ vendorId: 99 });

    await expect(
      service.createChat(
        { id_program: 1, pesan: 'Saya coba masuk' },
        6,
        'Vendor Lain',
        'Vendor',
        { id_user: 6, id_role: 6 },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects chat contexts that point to a different program', async () => {
    const { service } = makeService({ faseProgramId: 2 });

    await expect(
      service.createChat(
        { id_program: 1, id_fase: 2, pesan: 'Konteks salah' },
        3,
        'Head Office',
        'Head Office',
        { id_user: 3, id_role: 3 },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
