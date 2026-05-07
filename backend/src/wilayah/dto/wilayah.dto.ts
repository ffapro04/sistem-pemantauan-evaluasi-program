/* eslint-disable prettier/prettier */
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
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
  deskripsi?: string;

  // --- TAMBAHKAN FIELD INI ---
  @IsOptional()
  @IsString()
  alamat_lengkap?: string;
  // ---------------------------

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

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tahun_awal_binaan?: number;
}

export class UpdateWilayahDto extends PartialType(CreateWilayahDto) {}
