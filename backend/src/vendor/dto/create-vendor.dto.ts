/* eslint-disable prettier/prettier */
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsNumber,
} from 'class-validator';

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  nama_vendor: string;

  @IsString()
  @IsOptional()
  no_register?: string;

  @IsString()
  @IsOptional()
  npwp_file?: string;

  @IsString()
  @IsOptional()
  buku_rekening_file?: string;

  // --- DATA PENANGGUNG JAWAB ---
  @IsString()
  @IsNotEmpty()
  pj_1: string;

  @IsString()
  @IsNotEmpty()
  telp_pj_1: string;

  @IsString()
  @IsOptional()
  pj_2?: string;

  @IsString()
  @IsOptional()
  telp_pj_2?: string;

  @IsString()
  @IsOptional()
  ktp_pj_file?: string;

  @IsString()
  @IsOptional()
  akta_notaris_file?: string;

  // --- PILAR & AKSES ---
  @IsString()
  @IsNotEmpty()
  pilar: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsNumber()
  id_user?: number;
}
