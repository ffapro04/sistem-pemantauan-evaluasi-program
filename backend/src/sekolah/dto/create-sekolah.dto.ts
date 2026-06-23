/* eslint-disable prettier/prettier */
import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSekolahDto {
  @IsString()
  @IsNotEmpty()
  npsn: string;

  @IsString()
  @IsNotEmpty()
  nama_sekolah: string;

  @IsString()
  @IsNotEmpty()
  jenjang: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id_wilayah: number;

  @IsOptional()
  @IsString()
  nama_kabupaten?: string;

  @IsOptional()
  @IsString()
  kode_kabupaten?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  jumlah_guru?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  jumlah_siswa?: number;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty()
  email_login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password_login: string;

  // Field opsional untuk Edit nanti
  @IsOptional()
  @IsString()
  akreditasi?: string;

  @IsOptional()
  @IsString()
  akreditasi_internal?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tahun_binaan?: number;

  @IsOptional()
  @IsString()
  kriteria_2022?: string;

  @IsOptional()
  @IsString()
  sertifikat_iso?: string;

  @IsOptional()
  @IsString()
  adiwiyata?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;
}
