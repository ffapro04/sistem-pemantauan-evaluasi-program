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

export class CreateKelasDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id_sekolah: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tingkat: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  rombel: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_jurusan?: number;

  @IsOptional()
  @Transform(
    ({ value }) =>
      value === true || value === 'true' || value === 1 || value === '1',
  )
  @IsBoolean()
  status?: boolean;
}
