/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateSekolahDto } from './dto/create-sekolah.dto';
import { Sekolah } from './entities/sekolah.entity';

@Injectable()
export class SekolahService {
  private readonly ROLE_SEKOLAH_ID = 5;

  constructor(
    @InjectRepository(Sekolah)
    private sekolahRepo: Repository<Sekolah>,

    private dataSource: DataSource,
  ) {}

  // =========================================================
  // HELPER ROLE SEKOLAH
  // =========================================================
  private async ensureRoleSekolah(manager: any) {
    await manager.query(
      `
        INSERT INTO public.m_role (
          id_role,
          nama_role,
          deskripsi
        ) VALUES (
          $1,
          $2,
          $3
        )
        ON CONFLICT (id_role) DO UPDATE SET
          nama_role = EXCLUDED.nama_role,
          deskripsi = EXCLUDED.deskripsi
      `,
      [
        this.ROLE_SEKOLAH_ID,
        'Sekolah',
        'Akun sekolah untuk akses dashboard dan pengisian assessment',
      ],
    );
  }

  // =========================================================
  // HELPER SYNC USER SEKOLAH
  // Tidak pakai entity User karena entity User kamu belum punya property id_sekolah.
  // Semua sync ke m_users dilakukan pakai raw SQL.
  // =========================================================
  private async syncUserSekolah(
    manager: any,
    sekolah: Sekolah,
    inputData: any,
  ) {
    await this.ensureRoleSekolah(manager);

    const emailLogin = String(
      inputData.email_login || sekolah.email_login || '',
    ).trim();

    const passwordLogin = String(
      inputData.password_login || sekolah.password_login || '',
    ).trim();

    const namaSekolah = String(
      inputData.nama_sekolah || sekolah.nama_sekolah || '',
    ).trim();

    const statusSekolah =
      inputData.status !== undefined
        ? inputData.status
        : (sekolah.status ?? true);

    if (!emailLogin) {
      throw new InternalServerErrorException(
        'Email login sekolah wajib diisi agar akun sekolah dapat dibuat.',
      );
    }

    if (!namaSekolah) {
      throw new InternalServerErrorException(
        'Nama sekolah wajib diisi agar akun sekolah dapat dibuat.',
      );
    }

    const existingUsers = await manager.query(
      `
        SELECT
          id_user,
          id_sekolah,
          email
        FROM public.m_users
        WHERE id_sekolah = $1
           OR LOWER(TRIM(email)) = LOWER(TRIM($2))
        ORDER BY id_user ASC
        LIMIT 1
      `,
      [sekolah.id_sekolah, emailLogin],
    );

    const existingUser = existingUsers?.[0];

    if (
      existingUser?.id_sekolah &&
      Number(existingUser.id_sekolah) !== Number(sekolah.id_sekolah)
    ) {
      throw new ConflictException(
        'Email login sekolah sudah digunakan oleh sekolah lain.',
      );
    }

    if (existingUser) {
      const values: any[] = [
        namaSekolah,
        emailLogin,
        'Sekolah',
        '',
        'Sekolah',
        '',
        statusSekolah,
        this.ROLE_SEKOLAH_ID,
        sekolah.id_sekolah,
        existingUser.id_user,
      ];

      let passwordSql = '';

      if (passwordLogin) {
        values.push(passwordLogin);
        passwordSql = `, password = $${values.length}`;
      }

      await manager.query(
        `
          UPDATE public.m_users
          SET
            nama = $1,
            email = $2,
            jabatan = $3,
            no_telp = $4,
            jenis = $5,
            sub_jenis = $6,
            status = $7,
            id_role = $8,
            id_sekolah = $9,
            updated_at = NOW()
            ${passwordSql}
          WHERE id_user = $10
        `,
        values,
      );

      return;
    }

    await manager.query(
      `
        INSERT INTO public.m_users (
          nama,
          email,
          password,
          jabatan,
          no_telp,
          jenis,
          sub_jenis,
          status,
          created_at,
          updated_at,
          id_role,
          id_sekolah
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          NOW(),
          NOW(),
          $9,
          $10
        )
      `,
      [
        namaSekolah,
        emailLogin,
        passwordLogin,
        'Sekolah',
        '',
        'Sekolah',
        '',
        statusSekolah,
        this.ROLE_SEKOLAH_ID,
        sekolah.id_sekolah,
      ],
    );
  }

  // =========================================================
  // CREATE SEKOLAH + AUTO CREATE / AUTO LINK USER SEKOLAH
  // =========================================================
  async create(createSekolahDto: CreateSekolahDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sekolah = queryRunner.manager.create(Sekolah, {
        nama_sekolah: createSekolahDto.nama_sekolah,
        jenjang: createSekolahDto.jenjang,
        npsn: createSekolahDto.npsn,
        akreditasi: createSekolahDto.akreditasi,
        alamat: createSekolahDto.alamat,
        id_wilayah: Number(createSekolahDto.id_wilayah),
        latitude: Number(createSekolahDto.latitude) || 0,
        longitude: Number(createSekolahDto.longitude) || 0,
        jumlah_guru: Number(createSekolahDto.jumlah_guru) || 0,
        jumlah_siswa: Number(createSekolahDto.jumlah_siswa) || 0,
        email_login: createSekolahDto.email_login,
        password_login: createSekolahDto.password_login,
        status: true,
        area: createSekolahDto.area,
        kriteria_2022: createSekolahDto.kriteria_2022,
        sertifikat_iso: createSekolahDto.sertifikat_iso || 'Belum',
        adiwiyata: createSekolahDto.adiwiyata || 'Belum',
      });

      const sekolahSaved = await queryRunner.manager.save(Sekolah, sekolah);

      await this.syncUserSekolah(queryRunner.manager, sekolahSaved, {
        nama_sekolah: createSekolahDto.nama_sekolah,
        email_login: createSekolahDto.email_login,
        password_login: createSekolahDto.password_login,
        status: true,
      });

      await queryRunner.commitTransaction();

      return sekolahSaved;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      console.error('Create Sekolah Error:', error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error?.message || 'Gagal membuat data sekolah.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // =========================================================
  // FIND ALL
  // =========================================================
  async findAll() {
    return await this.sekolahRepo.find({
      relations: ['wilayah'],
      order: {
        nama_sekolah: 'ASC',
      },
      select: {
        id_sekolah: true,
        nama_sekolah: true,
        npsn: true,
        jenjang: true,
        akreditasi: true,
        alamat: true,
        id_wilayah: true,
        status: true,
        email_login: true,
        area: true,
        kriteria_2022: true,
        sertifikat_iso: true,
        adiwiyata: true,
        jumlah_guru: true,
        jumlah_siswa: true,
      },
    });
  }

  // =========================================================
  // FIND ONE
  // =========================================================
  async findOne(id: number) {
    const sekolah = await this.sekolahRepo.findOne({
      where: {
        id_sekolah: id,
      },
      relations: ['wilayah'],
      select: {
        id_sekolah: true,
        nama_sekolah: true,
        npsn: true,
        jenjang: true,
        akreditasi: true,
        alamat: true,
        id_wilayah: true,
        email_login: true,
        password_login: true,
        status: true,
        area: true,
        jumlah_guru: true,
        jumlah_siswa: true,
        kriteria_2022: true,
        sertifikat_iso: true,
        adiwiyata: true,
      },
    });

    if (!sekolah) {
      throw new NotFoundException(`Sekolah #${id} tidak ditemukan`);
    }

    return { ...sekolah };
  }

  // =========================================================
  // UPDATE SEKOLAH + AUTO SYNC USER SEKOLAH
  // =========================================================
  async update(id: number, updateData: any) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sekolah = await queryRunner.manager.findOne(Sekolah, {
        where: {
          id_sekolah: id,
        },
      });

      if (!sekolah) {
        throw new NotFoundException(`Sekolah dengan ID ${id} tidak ditemukan`);
      }

      await queryRunner.manager.update(Sekolah, { id_sekolah: id }, updateData);

      const sekolahUpdated = await queryRunner.manager.findOne(Sekolah, {
        where: {
          id_sekolah: id,
        },
      });

      if (!sekolahUpdated) {
        throw new NotFoundException(`Sekolah dengan ID ${id} tidak ditemukan`);
      }

      await this.syncUserSekolah(
        queryRunner.manager,
        sekolahUpdated,
        updateData,
      );

      await queryRunner.commitTransaction();

      return await this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      console.error('Update Sekolah Error:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        error?.message || 'Gagal memperbarui data sekolah.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // =========================================================
  // REMOVE SEKOLAH + DELETE USER SEKOLAH
  // =========================================================
  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sekolah = await queryRunner.manager.findOne(Sekolah, {
        where: {
          id_sekolah: id,
        },
      });

      if (!sekolah) {
        throw new NotFoundException(`Sekolah #${id} tidak ditemukan`);
      }

      await queryRunner.manager.query(
        `
          DELETE FROM public.m_users
          WHERE id_sekolah = $1
        `,
        [id],
      );

      await queryRunner.manager.delete(Sekolah, {
        id_sekolah: id,
      });

      await queryRunner.commitTransaction();

      return {
        message: `Sekolah #${id} dan akun aksesnya berhasil dihapus`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      console.error('Remove Sekolah Error:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error?.message || 'Gagal menghapus data sekolah.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
