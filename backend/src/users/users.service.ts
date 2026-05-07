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

  // --- 2. AMBIL SATU USER (FIX REVEAL PASSWORD) ---
  async findOne(id: number) {
    if (!id) throw new BadRequestException('ID User wajib disertakan');

    // Menggunakan QueryBuilder untuk memaksa kolom password yang di-hide (select: false) agar muncul
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.wilayah', 'wilayah')
      .leftJoinAndSelect('user.sekolah', 'sekolah')
      .addSelect('user.password') // <--- Paksa password keluar untuk detail
      .where('user.id_user = :id', { id })
      .getOne();

    if (!user)
      throw new NotFoundException(`User dengan ID #${id} tidak ditemukan`);

    // Return sebagai plain object agar tidak terkena Interceptor Serialization NestJS
    return { ...user };
  }

  // --- 3. AMBIL BERDASARKAN ROLE ---
  async getUsersByRole(roleName: string) {
    return this.userRepo.find({
      where: {
        role: {
          nama_role: roleName,
        },
      },
      relations: ['role', 'wilayah', 'sekolah'],
      order: { nama: 'ASC' },
    });
  }

  // --- 4. CARI BERDASARKAN EMAIL (LOGIN VALIDASI) ---
  // ✅ SESUDAH
  async findByEmail(email: string) {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.wilayah', 'wilayah')
      .leftJoinAndSelect('user.sekolah', 'sekolah')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  // --- 5. CREATE USER (ADMIN / PENGURUS / HO / AO) ---
  async create(data: any) {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email sudah terdaftar');

    try {
      const newUser = this.userRepo.create({
        nama: data.nama,
        email: data.email,
        password: data.password,
        jabatan: data.jabatan,
        no_telp: data.no_telp,
        jenis: data.jenis || null,
        sub_jenis: data.sub_jenis || null,
        // Konversi ke Number untuk memastikan integritas ID Role
        role: data.id_role ? ({ id_role: Number(data.id_role) } as any) : null,
      });

      const savedUser = await this.userRepo.save(newUser);

      if (data.id_wilayahs && Array.isArray(data.id_wilayahs)) {
        await this.wilayahRepo.update(
          { id_wilayah: In(data.id_wilayahs) },
          { user: savedUser },
        );
      }

      return savedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        'Gagal menyimpan user ke database.',
      );
    }
  }

  // --- 6. UPDATE USER ---
  async update(id: number, data: any) {
    // Gunakan findOne yang sudah kita perbaiki agar data lengkap terambil
    const user = await this.userRepo.findOne({ where: { id_user: id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const { id_role, id_wilayahs, id_sekolah, ...updateFields } = data;

    try {
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

      if (id_wilayahs && Array.isArray(id_wilayahs)) {
        await this.wilayahRepo.update({ user: { id_user: id } as any }, {
          user: null,
        } as any);
        await this.wilayahRepo.update(
          { id_wilayah: In(id_wilayahs) },
          { user: updatedUser },
        );
      }

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Gagal memperbarui data user.');
    }
  }

  // --- 7. DELETE USER ---
  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { id_user: id } });
    if (!user) throw new NotFoundException('User tidak ada');

    await this.wilayahRepo.update({ user: { id_user: id } as any }, {
      user: null,
    } as any);
    await this.userRepo.delete(id);
    return { success: true, message: `User berhasil dihapus` };
  }

  // --- 8. REGISTER (UMUM / SEKOLAH) ---
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
      // Default untuk pendaftaran mandiri biasanya SEKOLAH (ID 5 sesuai mapping baru kamu)
      role: data.id_role
        ? ({ id_role: Number(data.id_role) } as any)
        : { id_role: 5 },
      sekolah: data.id_sekolah
        ? ({ id_sekolah: Number(data.id_sekolah) } as any)
        : null,
    });

    return this.userRepo.save(user);
  }
}
