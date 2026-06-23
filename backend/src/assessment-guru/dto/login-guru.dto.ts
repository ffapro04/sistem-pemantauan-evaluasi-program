/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class LoginGuruDto {
  @Type(() => Number)
  @IsInt()
  id_sekolah: number;

  @IsString()
  @IsNotEmpty()
  nama_guru: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
