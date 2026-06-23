/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordGuruDto {
  @Type(() => Number)
  @IsInt()
  id_sekolah: number;

  @IsString()
  @IsNotEmpty()
  nama_guru: string;

  @IsString()
  @IsNotEmpty()
  email_sekolah: string;

  @IsString()
  @IsNotEmpty()
  password_sekolah: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password_baru: string;
}
