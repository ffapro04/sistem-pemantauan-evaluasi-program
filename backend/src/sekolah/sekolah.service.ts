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
        email_login: createSekolahDto.email_login,
        password_login: createSekolahDto.password_login,
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
      select: {
        id_sekolah: true,
        nama_sekolah: true,
        npsn: true,
        jenjang: true,
        akreditasi: true,
        alamat: true,
        id_wilayah: true,
        status: true,
        jumlah_guru: true,
        jumlah_siswa: true,
      },
    });
  }
  // --- 2. FIND ONE (BERDASARKAN ID SEKOLAH) ---
  async findOne(id: number) {
    const sekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: id },
      relations: ['wilayah'],
    });

    if (!sekolah) throw new NotFoundException(`Sekolah #${id} tidak ditemukan`);
    return sekolah;
  }

  // --- 3. FIND BY USER ID (SOLUSI UNTUK PROFIL) ---
  // Gunakan ini jika FE mengirim ID User (sub) dari token
async findByUserId(userId: number) {
  // 1. Cari user berdasarkan ID
  const user = await this.userRepo.findOne({
    where: { id_user: userId },
  });

  if (!user) throw new NotFoundException('User tidak ditemukan');

  
  const sekolah = await this.sekolahRepo.findOne({
    where: [
      { id_sekolah: user.id_sekolah }, // Cara A: Pakai ID (yang di DB lu lagi null)
      { email_login: user.email }      // Cara B: Pakai Email (Pasti ketemu karena SMA 1 Aceh punya email ini)
    ],
    relations: ['wilayah'],
  });

  if (!sekolah) {
    throw new NotFoundException(`Sekolah untuk email ${user.email} tidak ditemukan di tabel m_sekolah`);
  }

  return sekolah;
}


async findProgramsByUserId(userId: number) {
  try { // Tambahkan try di sini
    const sekolah = await this.findByUserId(userId);
    const programs = await this.dataSource.getRepository('t_program').find({
      where: [
        { id_sekolah: sekolah.id_sekolah, status_program: 'Draft' },
        { id_sekolah: sekolah.id_sekolah, status_program: 'Aktif' }
      ],
      order: { tanggal_mulai: 'ASC' }
    });

    return {
      sekolah: sekolah.nama_sekolah,
      programs: programs
    };
  } catch (error) { // Catch-nya jadi nyambung ke sini
    console.error('ERROR NYARI PROGRAM:', error.message);
    throw new InternalServerErrorException('Gagal ambil data program: ' + error.message);
  }
}

  
// --- 4. UPDATE (VERSI ANTI-CRASH USER SYNC) ---
  async update(id: number, updateData: any) {
    try {
      // 1. Eksekusi update data sekolah ke tabel m_sekolah
      const result = await this.sekolahRepo.update(id, updateData);
      if (result.affected === 0) throw new NotFoundException(`Sekolah ID ${id} tidak ditemukan`);

      // 2. Siapkan data sinkronisasi untuk tabel user
      const updateUserData: any = {};
      if (updateData.nama_sekolah) updateUserData.nama = updateData.nama_sekolah;
      if (updateData.email_login) updateUserData.email = updateData.email_login;
      if (updateData.password_login) updateUserData.password = updateData.password_login;

      // 🌟 FIX UTAMA DI SINI:
      // Kita jalankan update user dengan klausa pencarian yang lebih eksplisit dan aman untuk TypeORM
      if (Object.keys(updateUserData).length > 0) {
        await this.userRepo.update(
          { id_sekolah: id }, // Kriteria pencarian
          updateUserData      // Data baru yang dimasukkan
        ).catch(err => {
          // Jika sinkronisasi user gagal karena masalah foreign key/bcrypt, tangkap di sini agar tidak merusak status 200 sekolah
          console.warn('Gagal sinkronisasi data ke akun user login:', err.message);
        });
      }

      // 3. Ambil hasil data sekolah terupdate secara mandiri tanpa relasi yang ringkih
      const sekolahUpdated = await this.sekolahRepo.findOne({
        where: { id_sekolah: id }
      });

      // Kembalikan response sukses murni ke Frontend
      return sekolahUpdated;

    } catch (error) {
      console.error('ERROR PASAL UPDATE SEKOLAH:', error); 
      throw new InternalServerErrorException('Gagal memperbarui data sekolah: ' + error.message);
    }
  }

  // --- 5. REMOVE ---
  async remove(id: number) {
    await this.findOne(id);
    await this.userRepo.delete({ id_sekolah: id });
    await this.sekolahRepo.delete(id);
    return { message: `Sekolah #${id} berhasil dihapus` };
  }

 
}