/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateSekolahDto } from './dto/create-sekolah.dto';
import { Sekolah } from './entities/sekolah.entity';
import { Wilayah } from '../wilayah/entities/wilayah.entity';
import INDONESIA from '../data/indonesiaProvinces'; // Kamus script data lu jirr
import { NotifikasiService } from '../notifikasi/notifikasi.service';

@Injectable()
export class SekolahService {
  private readonly ROLE_SEKOLAH_ID = 5;

  constructor(
    @InjectRepository(Sekolah)
    private sekolahRepo: Repository<Sekolah>,

    private dataSource: DataSource,

    private readonly notifikasiService: NotifikasiService,
  ) {}

  private async resolveKabupatenWilayah(manager: any, wilayahIdRaw: any) {
    const wilayahId = Number(wilayahIdRaw);

    if (!Number.isFinite(wilayahId) || wilayahId <= 0) {
      throw new BadRequestException('Kabupaten/kota sekolah wajib dipilih.');
    }

    const wilayah = await manager.findOne(Wilayah, {
      where: { id_wilayah: wilayahId },
      relations: ['parent'],
    });

    if (!wilayah) {
      throw new BadRequestException(
        'Kabupaten/kota tidak ditemukan pada Master Wilayah.',
      );
    }

    const jenis = String(wilayah.jenis_wilayah || '').toUpperCase();

    if (jenis === 'PROVINSI') {
      throw new BadRequestException(
        'Sekolah harus memilih kabupaten/kota, bukan provinsi.',
      );
    }

    if (wilayah.status === false) {
      throw new BadRequestException(
        'Kabupaten/kota yang dipilih sedang nonaktif.',
      );
    }

    return wilayah;
  }
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

  private validateEmailLogin(email: string) {
    if (!email) {
      throw new BadRequestException('Email login sekolah wajib diisi.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Format email login sekolah tidak valid.');
    }
  }

  private validatePasswordLogin(password: string) {
    if (!password || password.length < 8) {
      throw new BadRequestException('Password login sekolah minimal 8 karakter.');
    }
  }

  // =========================================================
  // HELPER SYNC USER SEKOLAH
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

    this.validateEmailLogin(emailLogin);

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

    if (passwordLogin) {
      this.validatePasswordLogin(passwordLogin);
    }

    if (!existingUser) {
      this.validatePasswordLogin(passwordLogin);
    }

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
  async create(createSekolahDto: any, file?: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const idKabupatenRaw =
        createSekolahDto.id_kabupaten || createSekolahDto.id_wilayah;

      const kabupatenWilayah = await this.resolveKabupatenWilayah(
        queryRunner.manager,
        idKabupatenRaw,
      );

      const sekolah = queryRunner.manager.create(Sekolah, {
        npsn: createSekolahDto.npsn,
        nama_sekolah: createSekolahDto.nama_sekolah,
        jenjang: createSekolahDto.jenjang,

        id_wilayah: kabupatenWilayah.id_wilayah,

        id_kabupaten: kabupatenWilayah.id_wilayah,

        nama_kabupaten: kabupatenWilayah.nama_wilayah || null,
        kode_kabupaten: kabupatenWilayah.kode_wilayah || null,

        jumlah_guru: Number(createSekolahDto.jumlah_guru) || 0,
        jumlah_siswa: Number(createSekolahDto.jumlah_siswa) || 0,

        akreditasi: createSekolahDto.akreditasi || 'Belum Terakreditasi',
        akreditasi_internal: createSekolahDto.akreditasi_internal || 'Dasar',

        tahun_binaan:
          createSekolahDto.tahun_binaan !== undefined &&
          createSekolahDto.tahun_binaan !== null &&
          createSekolahDto.tahun_binaan !== ''
            ? Number(createSekolahDto.tahun_binaan)
            : null,

        alamat: createSekolahDto.alamat || null,

        latitude:
          createSekolahDto.latitude !== undefined &&
          createSekolahDto.latitude !== ''
            ? Number(createSekolahDto.latitude)
            : 0,

        longitude:
          createSekolahDto.longitude !== undefined &&
          createSekolahDto.longitude !== ''
            ? Number(createSekolahDto.longitude)
            : 0,

        area: kabupatenWilayah.area_wilayah || createSekolahDto.area || null,
        sertifikat_iso: createSekolahDto.sertifikat_iso || 'Belum',
        adiwiyata: createSekolahDto.adiwiyata || 'Belum',

        email_login: createSekolahDto.email_login
          ? String(createSekolahDto.email_login).trim().toLowerCase()
          : null,
        password_login: createSekolahDto.password_login
          ? String(createSekolahDto.password_login).trim()
          : null,

        status:
          createSekolahDto.status === undefined
            ? true
            : createSekolahDto.status === true ||
              createSekolahDto.status === 'true' ||
              createSekolahDto.status === 1 ||
              createSekolahDto.status === '1',

        logo_url: file ? `/uploads/sekolah/${file.filename}` : null,
      });

      const sekolahSaved = await queryRunner.manager.save(Sekolah, sekolah);

      /**
       * Sekarang akun login sekolah sudah dipisah ke Master Operator Sekolah.
       * Jadi sync user sekolah hanya dilakukan kalau email_login dikirim.
       * Ini membuat Create Sekolah tetap bisa tanpa akun login dan tanpa logo.
       */
      if (createSekolahDto.email_login) {
        this.validateEmailLogin(
          String(createSekolahDto.email_login || '').trim().toLowerCase(),
        );
        this.validatePasswordLogin(
          String(createSekolahDto.password_login || '').trim(),
        );

        await this.syncUserSekolah(queryRunner.manager, sekolahSaved, {
          nama_sekolah: createSekolahDto.nama_sekolah,
          email_login: String(createSekolahDto.email_login || '')
            .trim()
            .toLowerCase(),
          password_login: String(createSekolahDto.password_login || '').trim(),
          status: sekolahSaved.status,
        });
      }

      await queryRunner.commitTransaction();

      return sekolahSaved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Create Sekolah Error:', error);

      if (error instanceof ConflictException || error instanceof BadRequestException) {
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
  // 🚨 PERBAIKAN: FIND ALL (Suntik objek wilayah & Terjemahkan ID Kabupaten)
  // =========================================================
  async findAll() {
    const dataSekolah = await this.sekolahRepo.find({
      relations: ['wilayah', 'wilayah.parent'],
      order: { nama_sekolah: 'ASC' },
    });

    return dataSekolah;
  }

  // =========================================================
  // 🚨 PERBAIKAN: FIND ONE (Suntik objek wilayah & Terjemahkan ID Kabupaten)
  // =========================================================
  async findOne(id: number) {
    const sekolah = await this.sekolahRepo
      .createQueryBuilder('sekolah')
      .leftJoinAndSelect('sekolah.wilayah', 'wilayah')
      .leftJoinAndSelect('wilayah.parent', 'parent')
      .addSelect('sekolah.password_login')
      .where('sekolah.id_sekolah = :id', { id })
      .getOne();

    if (!sekolah) {
      throw new NotFoundException(`Sekolah #${id} tidak ditemukan`);
    }

    return sekolah;
  }

  private async syncJumlahGuruSekolah(idSekolah: number) {
    const rows = await this.dataSource.query(
      `
        SELECT COUNT(*)::int AS total
        FROM public.assessment_guru
        WHERE id_sekolah = $1
          AND is_active = true
      `,
      [idSekolah],
    );

    const totalGuru = Number(rows?.[0]?.total || 0);

    await this.sekolahRepo.update(
      { id_sekolah: idSekolah },
      { jumlah_guru: totalGuru },
    );

    return totalGuru;
  }

  async updateStatistikSekolah(id: number, body: any) {
    const sekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: id },
    });

    if (!sekolah) {
      throw new NotFoundException(`Sekolah dengan ID ${id} tidak ditemukan`);
    }

    const jumlahSiswaRaw = body?.jumlah_siswa;

    if (
      jumlahSiswaRaw === undefined ||
      jumlahSiswaRaw === null ||
      jumlahSiswaRaw === ''
    ) {
      throw new BadRequestException('Jumlah siswa wajib diisi.');
    }

    const jumlahSiswa = Number(jumlahSiswaRaw);

    if (
      !Number.isFinite(jumlahSiswa) ||
      jumlahSiswa < 0 ||
      !Number.isInteger(jumlahSiswa)
    ) {
      throw new BadRequestException(
        'Jumlah siswa harus berupa angka bulat minimal 0.',
      );
    }

    const jumlahSiswaSebelum = Number(sekolah.jumlah_siswa || 0);

    await this.sekolahRepo.update(
      { id_sekolah: id },
      {
        jumlah_siswa: jumlahSiswa,
      },
    );

    const totalGuruAktif = await this.syncJumlahGuruSekolah(id);

    const updatedSekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: id },
      relations: ['wilayah', 'wilayah.parent'],
    });

    await this.notifikasiService.notifyAdmins({
      judul: 'Statistik Sekolah Diperbarui',
      pesan: `${sekolah.nama_sekolah} memperbarui jumlah siswa dari ${jumlahSiswaSebelum} menjadi ${jumlahSiswa}. Total guru aktif sekarang ${totalGuruAktif}.`,
      tipe: 'SEKOLAH',
      targetUrl: `/admin/sekolah/detail/${id}`,
      metadata: {
        action: 'UPDATE_STATISTIK_SEKOLAH',
        id_sekolah: id,
        nama_sekolah: sekolah.nama_sekolah,
        jumlah_siswa_sebelum: jumlahSiswaSebelum,
        jumlah_siswa_sesudah: jumlahSiswa,
        total_guru_aktif: totalGuruAktif,
      },
    });

    return {
      status: true,
      message: 'Statistik sekolah berhasil diperbarui.',
      data: updatedSekolah,
    };
  }
  // =========================================================
  // UPDATE SEKOLAH + AUTO SYNC USER SEKOLAH
  // =========================================================

  async update(id: number, updateSekolahDto: any, file?: Express.Multer.File) {
    const sekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: id },
    });

    if (!sekolah) {
      throw new NotFoundException(`Sekolah dengan ID ${id} tidak ditemukan`);
    }

    const idKabupatenRaw =
      updateSekolahDto.id_kabupaten ||
      updateSekolahDto.id_wilayah ||
      sekolah.id_kabupaten ||
      sekolah.id_wilayah;

    const kabupatenWilayah = await this.resolveKabupatenWilayah(
      this.sekolahRepo.manager,
      idKabupatenRaw,
    );

    const dataUpdate: any = {
      nama_sekolah:
        updateSekolahDto.nama_sekolah !== undefined
          ? updateSekolahDto.nama_sekolah
          : sekolah.nama_sekolah,

      npsn:
        updateSekolahDto.npsn !== undefined
          ? updateSekolahDto.npsn
          : sekolah.npsn,

      alamat:
        updateSekolahDto.alamat !== undefined
          ? updateSekolahDto.alamat
          : sekolah.alamat,

      jenjang:
        updateSekolahDto.jenjang !== undefined
          ? updateSekolahDto.jenjang
          : sekolah.jenjang,

      akreditasi:
        updateSekolahDto.akreditasi !== undefined
          ? updateSekolahDto.akreditasi
          : sekolah.akreditasi,

      akreditasi_internal:
        updateSekolahDto.akreditasi_internal !== undefined
          ? updateSekolahDto.akreditasi_internal
          : sekolah.akreditasi_internal,

      tahun_binaan:
        updateSekolahDto.tahun_binaan !== undefined &&
        updateSekolahDto.tahun_binaan !== null &&
        updateSekolahDto.tahun_binaan !== ''
          ? Number(updateSekolahDto.tahun_binaan)
          : sekolah.tahun_binaan,

      email_login:
        updateSekolahDto.email_login !== undefined
          ? String(updateSekolahDto.email_login || '').trim().toLowerCase()
          : sekolah.email_login,

      password_login:
        updateSekolahDto.password_login !== undefined
          ? String(updateSekolahDto.password_login || '').trim()
          : sekolah.password_login,

      id_wilayah: kabupatenWilayah.id_wilayah,

      id_kabupaten: kabupatenWilayah.id_wilayah,

      nama_kabupaten: kabupatenWilayah.nama_wilayah || sekolah.nama_kabupaten,

      kode_kabupaten: kabupatenWilayah.kode_wilayah || sekolah.kode_kabupaten,

      jumlah_guru:
        updateSekolahDto.jumlah_guru !== undefined
          ? Number(updateSekolahDto.jumlah_guru) || 0
          : sekolah.jumlah_guru,

      jumlah_siswa:
        updateSekolahDto.jumlah_siswa !== undefined
          ? Number(updateSekolahDto.jumlah_siswa) || 0
          : sekolah.jumlah_siswa,

      latitude:
        updateSekolahDto.latitude !== undefined &&
        updateSekolahDto.latitude !== ''
          ? Number(updateSekolahDto.latitude)
          : sekolah.latitude,

      longitude:
        updateSekolahDto.longitude !== undefined &&
        updateSekolahDto.longitude !== ''
          ? Number(updateSekolahDto.longitude)
          : sekolah.longitude,

      area:
        kabupatenWilayah.area_wilayah ||
        (updateSekolahDto.area !== undefined
          ? updateSekolahDto.area
          : sekolah.area),

      sertifikat_iso:
        updateSekolahDto.sertifikat_iso !== undefined
          ? updateSekolahDto.sertifikat_iso
          : sekolah.sertifikat_iso,

      adiwiyata:
        updateSekolahDto.adiwiyata !== undefined
          ? updateSekolahDto.adiwiyata
          : sekolah.adiwiyata,
    };
    if (updateSekolahDto.status !== undefined) {
      dataUpdate.status =
        updateSekolahDto.status === true ||
        updateSekolahDto.status === 'true' ||
        updateSekolahDto.status === 1 ||
        updateSekolahDto.status === '1';
    }

    if (file) {
      dataUpdate.logo_url = `/uploads/sekolah/${file.filename}`;
    }

    if (updateSekolahDto.email_login !== undefined) {
      this.validateEmailLogin(dataUpdate.email_login);
    }

    if (
      updateSekolahDto.password_login !== undefined &&
      String(updateSekolahDto.password_login || '').trim()
    ) {
      this.validatePasswordLogin(String(updateSekolahDto.password_login).trim());
    }

    await this.sekolahRepo.update({ id_sekolah: id }, dataUpdate);

    const updatedSekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: id },
      relations: ['wilayah', 'wilayah.parent'],
    });

    if (
      updateSekolahDto.email_login ||
      updateSekolahDto.password_login ||
      updateSekolahDto.nama_sekolah
    ) {
      await this.dataSource.transaction(async (manager) => {
        await this.syncUserSekolah(manager, updatedSekolah, {
          nama_sekolah: dataUpdate.nama_sekolah,
          email_login: dataUpdate.email_login,
          password_login: updateSekolahDto.password_login,
          status:
            dataUpdate.status !== undefined
              ? dataUpdate.status
              : updatedSekolah.status,
        });
      });
    }

    return {
      status: true,
      message: file
        ? 'Data sekolah dan logo berhasil diperbarui.'
        : 'Data sekolah berhasil diperbarui.',
      data: updatedSekolah,
    };
  }

  async updateJumlahSiswaOperator(idSekolah: any, jumlahSiswa: any) {
    const id = Number(idSekolah);
    const total = Number(jumlahSiswa);

    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('ID sekolah tidak valid');
    }

    if (!Number.isInteger(total) || total < 0) {
      throw new BadRequestException(
        'Jumlah siswa harus berupa angka minimal 0',
      );
    }

    const sekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: id },
    });

    if (!sekolah) {
      throw new NotFoundException('Sekolah tidak ditemukan');
    }

    await this.sekolahRepo.update({ id_sekolah: id }, { jumlah_siswa: total });

    return {
      message: 'Jumlah siswa berhasil diperbarui',
      data: {
        id_sekolah: id,
        jumlah_siswa: total,
      },
    };
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
        where: { id_sekolah: id },
      });

      if (!sekolah) {
        throw new NotFoundException(`Sekolah #${id} tidak ditemukan`);
      }

      await queryRunner.manager.query(
        `DELETE FROM public.m_users WHERE id_sekolah = $1`,
        [id],
      );

      await queryRunner.manager.delete(Sekolah, { id_sekolah: id });
      await queryRunner.commitTransaction();

      return { message: `Sekolah #${id} dan akun aksesnya berhasil dihapus` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Remove Sekolah Error:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Gagal menghapus data sekolah.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
