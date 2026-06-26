/* eslint-disable prettier/prettier */
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateWilayahDto {
  @IsOptional()
  @IsString()
  kode_wilayah?: string;

  @IsNotEmpty()
  @IsString()
  nama_wilayah: string;

  @IsOptional()
  @IsString()
  tipe_wilayah?: string;

  @IsOptional()
  @IsString()
  jenis_wilayah?: string;

  @IsOptional()
  @IsString()
  area_wilayah?: string;

  // Biar aman kalau frontend lama/baru masih kirim keterangan.
  // Ini tidak disimpan sebagai kolom, hanya dipakai buat normalisasi.
  @IsOptional()
  @IsString()
  keterangan?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsString()
  alamat_lengkap?: string;

  @IsOptional()
  @IsString()
  luas_wilayah?: string;

  @IsOptional()
  @IsString()
  letak_geografis?: string;

  @IsOptional()
  @IsString()
  letak_astronomis?: string;

  @IsOptional()
  @IsArray()
  bounds?: number[][];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_parent?: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  jumlah_sd?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  jumlah_smp?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  jumlah_smk?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  jumlah_guru?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  jumlah_siswa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tahun_awal_binaan?: number;
}

export class UpdateWilayahDto extends PartialType(CreateWilayahDto) {}
