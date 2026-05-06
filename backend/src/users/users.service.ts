/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './user.entity';
import { Wilayah } from '../wilayah/entities/wilayah.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Wilayah)
    private wilayahRepo: Repository<Wilayah>,
  ) {}

  // --- 1. AMBIL SEMUA USER ---
  async findAll() {
    return this.userRepo.find({
      relations: ['role', 'wilayah', 'sekolah'],
      order: { id_user: 'DESC' },
    });
  }

  // --- 2. AMBIL SATU USER BERDASARKAN ID (DENGAN PASSWORD) ---
  async findOne(id: number) {
    if (!id) throw new BadRequestException('ID User wajib disertakan');

    // Gunakan QueryBuilder agar bisa memanggil field yang di-hide (select: false)
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.wilayah', 'wilayah')
      .leftJoinAndSelect('user.sekolah', 'sekolah')
      .addSelect('user.password') // <--- INI KUNCINYA: Memaksa password ikut ditarik
      .where('user.id_user = :id', { id })
      .getOne();

    if (!user)
      throw new NotFoundException(`User dengan ID #${id} tidak ditemukan`);
    return user;
  }

  // --- 3. AMBIL BERDASARKAN ROLE (AO / HO / PENGURUS) ---
  async getUsersByRole(roleName: string) {
    return this.userRepo.find({
      where: {
        role: {
          nama_role: roleName, // Ini akan mencari string 'HO' atau 'PENGURUS' sesuai yang dikirim Controller
        },
      },
      relations: ['role', 'wilayah', 'sekolah'],
      order: { nama: 'ASC' },
    });
  }

  // --- 4. CARI BERDASARKAN EMAIL (VALIDASI) ---
  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
      relations: ['role', 'wilayah', 'sekolah'],
      select: [
        'id_user',
        'email',
        'password',
        'nama',
        'jabatan',
        'status',
        'jenis',
        'sub_jenis',
      ],
    });
  }

  // --- 5. CREATE USER (AO / PENGURUS / HO) ---
  async create(data: any) {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email sudah terdaftar');

    try {
      // A. Simpan User
      const newUser = this.userRepo.create({
        nama: data.nama,
        email: data.email,
        password: data.password,
        jabatan: data.jabatan,
        no_telp: data.no_telp,
        jenis: data.jenis || null,
        sub_jenis: data.sub_jenis || null,
        role: data.id_role ? ({ id_role: Number(data.id_role) } as any) : null,
      });

      const savedUser = await this.userRepo.save(newUser);

      // B. LOGIKA MULTI-WILAYAH (1 AO -> Banyak Wilayah)
      if (data.id_wilayahs && Array.isArray(data.id_wilayahs)) {
        await this.wilayahRepo.update(
          { id_wilayah: In(data.id_wilayahs) },
          { user: savedUser }, // 👈 SUDAH DIGANTI: Menggunakan 'user' sesuai Entity
        );
      }

      return savedUser;
    } catch (error) {
      console.error('ERROR_CREATE:', error.message);
      throw new InternalServerErrorException('Gagal menyimpan user.');
    }
  }

  // --- 6. UPDATE USER (PATCH) ---
  async update(id: number, data: any) {
    const user = await this.findOne(id);
    const { id_role, id_wilayahs, id_sekolah, ...updateFields } = data;

    try {
      // A. Update Field Standar
      Object.assign(user, updateFields);

      if (id_role !== undefined) {
        user.role = id_role ? ({ id_role: Number(id_role) } as any) : null;
      }
      if (id_sekolah !== undefined) {
        user.sekolah = id_sekolah
          ? ({ id_sekolah: Number(id_sekolah) } as any)
          : null;
      }

      const updatedUser = await this.userRepo.save(user);

      // B. UPDATE RELASI MULTI-WILAYAH
      if (id_wilayahs && Array.isArray(id_wilayahs)) {
        // Step 1: Lepaskan wilayah lama (set null)
        await this.wilayahRepo.update(
          { user: { id_user: id } as any }, // 👈 SUDAH DIGANTI: Menggunakan 'user'
          { user: null } as any,
        );

        // Step 2: Pasangkan wilayah baru
        await this.wilayahRepo.update(
          { id_wilayah: In(id_wilayahs) },
          { user: updatedUser }, // 👈 SUDAH DIGANTI: Menggunakan 'user'
        );
      }

      return updatedUser;
    } catch (error) {
      console.error('ERROR_UPDATE:', error.message);
      throw new InternalServerErrorException('Gagal memperbarui data user.');
    }
  }

  // --- 7. DELETE USER ---
  async remove(id: number) {
    const user = await this.findOne(id);

    // Lepaskan dulu wilayah-wilayah yang dia pegang
    await this.wilayahRepo.update(
      { user: { id_user: id } as any }, // 👈 SUDAH DIGANTI: Menggunakan 'user'
      { user: null } as any,
    );

    await this.userRepo.delete(id);
    return { success: true, message: `User ${user.nama} berhasil dihapus` };
  }

  // --- 8. REGISTER (GURU / UMUM) ---
  async register(data: any) {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const user = this.userRepo.create({
      nama: data.nama,
      email: data.email,
      password: data.password,
      no_telp: data.no_telp,
      jenis: data.jenis,
      sub_jenis: data.sub_jenis,
      role: data.id_role
        ? ({ id_role: Number(data.id_role) } as any)
        : { id_role: 3 },
      sekolah: data.id_sekolah
        ? ({ id_sekolah: Number(data.id_sekolah) } as any)
        : null,
    });

    return this.userRepo.save(user);
  }
}
