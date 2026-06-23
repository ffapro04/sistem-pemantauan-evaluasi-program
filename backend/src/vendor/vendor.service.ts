/* eslint-disable prettier/prettier */
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.entity';
import { UsersService } from '../users/users.service';
import type { VendorDocumentFiles } from './vendor.controller';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepo: Repository<Vendor>,

    private usersService: UsersService,
  ) {}

  private getUploadedFilename(
    files: VendorDocumentFiles | undefined,
    fieldName: keyof VendorDocumentFiles,
  ): string | undefined {
    return files?.[fieldName]?.[0]?.filename;
  }

  async create(createVendorDto: CreateVendorDto, files?: VendorDocumentFiles) {
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
        no_register: createVendorDto.no_register || null,
        pj_1: createVendorDto.pj_1,
        telp_pj_1: createVendorDto.telp_pj_1,
        pj_2: createVendorDto.pj_2 || null,
        telp_pj_2: createVendorDto.telp_pj_2 || null,
        pilar: createVendorDto.pilar,
        alamat: createVendorDto.alamat || null,
        status: 'Bermitra',
        user: userBaru,

        npwp_file:
          this.getUploadedFilename(files, 'npwp_file') ||
          createVendorDto.npwp_file ||
          null,

        ktp_pj_file:
          this.getUploadedFilename(files, 'ktp_pj_file') ||
          createVendorDto.ktp_pj_file ||
          null,

        akta_notaris_file:
          this.getUploadedFilename(files, 'akta_notaris_file') ||
          createVendorDto.akta_notaris_file ||
          null,
      });

      return await this.vendorRepo.save(vendorBaru);
    } catch (error) {
      console.error('ERROR_CREATE_VENDOR:', error?.message || error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Gagal mendaftarkan vendor.');
    }
  }

  async findAll() {
    return await this.vendorRepo.find({
      relations: ['user'],
      order: {
        nama_vendor: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const vendor = await this.vendorRepo.findOne({
      where: {
        id_vendor: id,
      },
      relations: ['user'],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor #${id} tidak ditemukan`);
    }

    if (vendor.user) {
      delete (vendor.user as any).password;
    }

    return vendor;
  }

  async update(
    id: number,
    updateVendorDto: UpdateVendorDto,
    files?: VendorDocumentFiles,
  ) {
    try {
      const vendor = await this.vendorRepo.findOne({
        where: {
          id_vendor: id,
        },
        relations: ['user'],
      });

      if (!vendor) {
        throw new NotFoundException(`Vendor #${id} tidak ditemukan`);
      }

      const data = updateVendorDto as any;

      if (data.nama_vendor !== undefined) {
        vendor.nama_vendor = String(data.nama_vendor || '').trim();
      }

      if (data.no_register !== undefined) {
        vendor.no_register = data.no_register || null;
      }

      if (data.pj_1 !== undefined) {
        vendor.pj_1 = data.pj_1 || null;
      }

      if (data.telp_pj_1 !== undefined) {
        vendor.telp_pj_1 = data.telp_pj_1 || null;
      }

      if (data.pj_2 !== undefined) {
        vendor.pj_2 = data.pj_2 || null;
      }

      if (data.telp_pj_2 !== undefined) {
        vendor.telp_pj_2 = data.telp_pj_2 || null;
      }

      if (data.pilar !== undefined) {
        vendor.pilar = data.pilar || null;
      }

      if (data.alamat !== undefined) {
        vendor.alamat = data.alamat || null;
      }

      if (data.status !== undefined) {
        vendor.status = data.status || 'Bermitra';
      }

      const npwpFilename = this.getUploadedFilename(files, 'npwp_file');

      const ktpFilename = this.getUploadedFilename(files, 'ktp_pj_file');

      const aktaFilename = this.getUploadedFilename(files, 'akta_notaris_file');

      if (npwpFilename) {
        vendor.npwp_file = npwpFilename;
      } else if (data.npwp_file !== undefined && data.npwp_file !== '') {
        vendor.npwp_file = data.npwp_file;
      }

      if (ktpFilename) {
        vendor.ktp_pj_file = ktpFilename;
      } else if (data.ktp_pj_file !== undefined && data.ktp_pj_file !== '') {
        vendor.ktp_pj_file = data.ktp_pj_file;
      }

      if (aktaFilename) {
        vendor.akta_notaris_file = aktaFilename;
      } else if (
        data.akta_notaris_file !== undefined &&
        data.akta_notaris_file !== ''
      ) {
        vendor.akta_notaris_file = data.akta_notaris_file;
      }

      const updatedVendor = await this.vendorRepo.save(vendor);

      if (updatedVendor.user?.id_user) {
        const userUpdate: any = {};

        if (data.email !== undefined && String(data.email).trim()) {
          userUpdate.email = String(data.email).trim();
        }

        if (data.password !== undefined && String(data.password).trim()) {
          userUpdate.password = String(data.password);
        }

        if (data.pj_1 !== undefined && String(data.pj_1).trim()) {
          userUpdate.nama = String(data.pj_1).trim();
        }

        if (Object.keys(userUpdate).length > 0) {
          await this.usersService.update(
            updatedVendor.user.id_user,
            userUpdate,
          );
        }
      }

      return await this.findOne(id);
    } catch (error) {
      console.error('ERROR_UPDATE_VENDOR:', error?.message || error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Gagal memperbarui data vendor.');
    }
  }

  async remove(id: number) {
    const vendor = await this.findOne(id);

    await this.vendorRepo.delete(id);

    return {
      message: `Vendor ${vendor.nama_vendor} berhasil dihapus`,
    };
  }
}
