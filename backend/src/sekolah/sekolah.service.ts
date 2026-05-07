/* eslint-disable prettier/prettier */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateSekolahDto } from './dto/create-sekolah.dto';
import { Sekolah } from './entities/sekolah.entity';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';

@Injectable()
export class SekolahService {
  constructor(
    @InjectRepository(Sekolah)
    private sekolahRepo: Repository<Sekolah>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private dataSource: DataSource,
  ) {}

  // --- 1. CREATE (DENGAN TRANSAKSI) ---
  async create(createSekolahDto: CreateSekolahDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Simpan data ke tabel Sekolah
      const sekolah = queryRunner.manager.create(Sekolah, {
        nama_sekolah: createSekolahDto.nama_sekolah,
        jenjang: createSekolahDto.jenjang,
        npsn: createSekolahDto.npsn,
        akreditasi: createSekolahDto.akreditasi,
        alamat: createSekolahDto.alamat,
        id_wilayah: Number(createSekolahDto.id_wilayah),
        latitude: createSekolahDto.latitude || 0,
        longitude: createSekolahDto.longitude || 0,
        jumlah_guru: createSekolahDto.jumlah_guru || 0,
        jumlah_siswa: createSekolahDto.jumlah_siswa || 0,
        // --- TAMBAHKAN INI AGAR DATA TERSIMPAN DI TABEL SEKOLAH ---
        email_login: createSekolahDto.email_login, // <--- TAMBAHKAN INI
        password_login: createSekolahDto.password_login, // <--- TAMBAHKAN INI
        // ---------------------------------------------------------
      });
      const sekolahSaved = await queryRunner.manager.save(sekolah);

      let roleSekolah = await queryRunner.manager.findOne(Role, {
        where: { nama_role: 'SEKOLAH' },
      });

      if (!roleSekolah) {
        roleSekolah = queryRunner.manager.create(Role, {
          id_role: 5,
          nama_role: 'SEKOLAH',
          deskripsi: 'Akun Sekolah Binaan',
        });
        await queryRunner.manager.save(roleSekolah);
      }

      // 3. Simpan kredensial ke tabel Users (Untuk Login)
      const userBaru = queryRunner.manager.create(User, {
        nama: createSekolahDto.nama_sekolah,
        email: createSekolahDto.email_login,
        password: createSekolahDto.password_login,
        id_sekolah: sekolahSaved.id_sekolah,
        role: roleSekolah,
        status: true,
        jenis: 'Sekolah',
      });
      await queryRunner.manager.save(userBaru);

      await queryRunner.commitTransaction();
      return sekolahSaved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.sekolahRepo.find({
      relations: ['wilayah'],
      order: { nama_sekolah: 'ASC' },
      // password_login tidak di-select di sini, hanya di findOne
      select: {
        id_sekolah: true,
        nama_sekolah: true,
        npsn: true,
        jenjang: true,
        akreditasi: true,
        alamat: true,
        id_wilayah: true,
        status: true,
        // password_login sengaja tidak dimasukkan
      },
    });
  }

  async findOne(id: number) {
    const sekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: id },
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
      },
    });

    console.log('RAW DATA:', JSON.stringify(sekolah)); // TAMBAH INI

    if (!sekolah) throw new NotFoundException(`Sekolah #${id} tidak ditemukan`);
    return { ...sekolah };
  }

  // --- 3. UPDATE (FIX: SYNC KE TABEL USERS) ---
  async update(id: number, updateData: any) {
    try {
      // A. Update data di tabel m_sekolah
      const result = await this.sekolahRepo.update(id, updateData);

      if (result.affected === 0) {
        throw new NotFoundException(`Sekolah dengan ID ${id} tidak ditemukan`);
      }

      // B. SINKRONISASI KE TABEL m_users (Jika nama, email, atau password berubah)
      // Kita cari user yang punya id_sekolah ini
      const updateUserData: any = {};
      if (updateData.nama_sekolah)
        updateUserData.nama = updateData.nama_sekolah;
      if (updateData.email_login) updateUserData.email = updateData.email_login;
      if (updateData.password_login)
        updateUserData.password = updateData.password_login;
      if (updateData.status !== undefined)
        updateUserData.status = updateData.status;

      if (Object.keys(updateUserData).length > 0) {
        await this.userRepo.update(
          { sekolah: { id_sekolah: id } }, // Cari user berdasarkan relasi id_sekolah
          updateUserData,
        );
      }

      return await this.findOne(id);
    } catch (error) {
      console.error('Error Database:', error.message);
      if (error.message.includes('id_wilayah')) {
        throw new InternalServerErrorException(
          'Gagal update: Masalah relasi wilayah.',
        );
      }
      throw new InternalServerErrorException('Gagal memperbarui data sekolah.');
    }
  }

  // --- 4. REMOVE (DENGAN CASCADE USER) ---
  async remove(id: number) {
    // Cari dulu datanya
    await this.findOne(id);

    // Hapus di tabel User dulu (karena id_sekolah adalah FK)
    await this.userRepo.delete({ sekolah: { id_sekolah: id } });

    // Baru hapus di tabel Sekolah
    await this.sekolahRepo.delete(id);

    return { message: `Sekolah #${id} dan akun aksesnya berhasil dihapus` };
  }
}
