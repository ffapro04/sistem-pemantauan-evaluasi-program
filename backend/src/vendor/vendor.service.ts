/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.entity';
import { UsersService } from '../users/users.service';
import { InjectRepository as InjectRepo } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepo: Repository<Vendor>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private usersService: UsersService,
  ) {}

  async create(createVendorDto: CreateVendorDto) {
    try {
      const userBaru = await this.usersService.create({
        nama: createVendorDto.pj_1,
        email: createVendorDto.email,
        password: createVendorDto.password,
        jabatan: 'Vendor Partner',
        id_role: 6,
        status: true,
      });

      const vendorBaru = this.vendorRepo.create({
        nama_vendor: createVendorDto.nama_vendor,
        no_register: createVendorDto.no_register,
        pj_1: createVendorDto.pj_1,
        telp_pj_1: createVendorDto.telp_pj_1,
        pj_2: createVendorDto.pj_2,
        telp_pj_2: createVendorDto.telp_pj_2,
        pilar: createVendorDto.pilar,
        alamat: createVendorDto.alamat,
        status: 'Bermitra',
        user: userBaru,
        npwp_file: createVendorDto.npwp_file,
        ktp_pj_file: createVendorDto.ktp_pj_file,
      });

      return await this.vendorRepo.save(vendorBaru);
    } catch (error) {
      console.error('ERROR_CREATE_VENDOR:', error.message);
      throw new InternalServerErrorException('Gagal mendaftarkan vendor.');
    }
  }

  async findAll() {
    return await this.vendorRepo.find({
      relations: ['user'],
      order: { nama_vendor: 'ASC' },
    });
  }

  // FIX: Select password dari relasi user
  async findOne(id: number) {
    const vendor = await this.vendorRepo.findOne({
      where: { id_vendor: id },
      relations: ['user'],
      select: {
        id_vendor: true,
        nama_vendor: true,
        no_register: true,
        pilar: true,
        alamat: true,
        pj_1: true,
        telp_pj_1: true,
        pj_2: true,
        telp_pj_2: true,
        npwp_file: true,
        ktp_pj_file: true,
        status: true,
        user: {
          id_user: true,
          email: true,
          password: true, // <-- password ikut diambil
        },
      },
    });

    if (!vendor) throw new NotFoundException(`Vendor #${id} tidak ditemukan`);
    return { ...vendor };
  }

  // FIX: Sync update ke tabel m_users juga
  async update(id: number, updateVendorDto: UpdateVendorDto) {
    try {
      const vendor = await this.findOne(id);

      // A. Update tabel m_vendor
      const { email, password, ...vendorData } = updateVendorDto as any;
      await this.vendorRepo.update(id, vendorData);

      // B. Sync ke tabel m_users jika ada perubahan email atau password
      if (vendor.user?.id_user) {
        const userUpdate: any = {};
        if (email) userUpdate.email = email;
        if (password) userUpdate.password = password;

        if (Object.keys(userUpdate).length > 0) {
          await this.userRepo.update(vendor.user.id_user, userUpdate);
        }
      }

      return await this.findOne(id);
    } catch (error) {
      console.error('ERROR_UPDATE_VENDOR:', error.message);
      throw new InternalServerErrorException('Gagal memperbarui data vendor.');
    }
  }

  async remove(id: number) {
    const vendor = await this.findOne(id);
    await this.vendorRepo.delete(id);
    return { message: `Vendor ${vendor.nama_vendor} berhasil dihapus` };
  }
}
