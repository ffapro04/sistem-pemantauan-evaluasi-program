/* eslint-disable prettier/prettier */
import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsEmail,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSekolahDto {
  @IsString()
  @IsNotEmpty()
  nama_sekolah: string;

  @IsString()
  @IsNotEmpty()
  jenjang: string;

  @IsNotEmpty()
  @IsString()
  npsn: string;

  @IsNotEmpty()
  @IsString()
  akreditasi: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  id_wilayah: number;

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
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  kriteria_2022?: string;

  @IsOptional()
  @IsString()
  sertifikat_iso?: string;

  @IsOptional()
  @IsString()
  adiwiyata?: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty()
  email_login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password minimal harus 8 karakter' })
  password_login: string;
}
