/* eslint-disable prettier/prettier */
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  @Type(() => Number)
  @IsNumber()
  id_user?: number;
}
