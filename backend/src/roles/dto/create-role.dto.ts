/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  nama_role: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;
}
