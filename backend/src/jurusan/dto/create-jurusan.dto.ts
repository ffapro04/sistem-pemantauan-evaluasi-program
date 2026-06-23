/* eslint-disable prettier/prettier */
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateJurusanDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id_sekolah: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nama_jurusan: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  kode_jurusan: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @Transform(
    ({ value }) =>
      value === true || value === 'true' || value === 1 || value === '1',
  )
  @IsBoolean()
  status?: boolean;
}
