/* eslint-disable prettier/prettier */
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

const optionalNumber = ({ value }: { value: any }) => {
  if (value === undefined || value === null || value === '') return undefined;
  return Number(value);
};

export class RegisterGuruDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_sekolah: number;

  @IsString()
  @IsNotEmpty()
  nama_guru: string;

  @IsString()
  @IsOptional()
  @IsEmail({}, { message: 'Format email guru tidak valid' })
  email_guru?: string;

  @IsString()
  @IsOptional()
  no_telepon?: string;

  // Guru Kelas / Guru Bidang Studi / Produktif / Adaptif / Normatif
  @IsString()
  @IsOptional()
  jenis_guru?: string;

  // SD/SMP/SMK: mata pelajaran utama guru
  @IsString()
  @IsOptional()
  mata_pelajaran?: string;

  // Wali kelas opsional, ambil dari master kelas
  @Transform(optionalNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  id_kelas?: number;

  // Jurusan opsional, khusus SMK, ambil dari master jurusan
  @Transform(optionalNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  id_jurusan?: number;

  // Legacy text: biarkan dulu agar data lama tetap aman
  @IsString()
  @IsOptional()
  kelas_wali?: string;

  @IsString()
  @IsOptional()
  jurusan?: string;

  // Legacy: tidak dipakai lagi di tabel Daftar Guru karena diganti Mata Pelajaran
  @IsString()
  @IsOptional()
  nip?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password guru minimal 8 karakter' })
  password: string;
}
