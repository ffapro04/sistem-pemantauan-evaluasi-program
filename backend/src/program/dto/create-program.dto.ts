/* eslint-disable prettier/prettier */
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateKegiatansDto {
  @IsString()
  @IsNotEmpty()
  nama_kegiatans: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsNumber()
  @Type(() => Number)
  urutan: number;
}

export class CreateFaseWithKegiatansDto {
  @IsString()
  @IsNotEmpty()
  nama_fase: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsNumber()
  @Type(() => Number)
  urutan: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKegiatansDto)
  kegiatans?: CreateKegiatansDto[];
}

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  nama_program: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id_sekolah: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id_pengawas: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  harga_vendor?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string' && value.trim() !== '') {
      return value.split(',').map((v) => Number(v.trim()));
    }
    if (typeof value === 'number') return [value];
    return value;
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  id_vendor?: number[];

  @IsOptional()
  file_mou?: any; // Mencegah error 400 karena field file

  @IsString()
  @IsNotEmpty()
  kategori: string;

  @IsString()
  @IsNotEmpty()
  status_program: string;

  @IsOptional()
  @IsString()
  tahun?: string;

  @IsOptional()
  @IsString()
  tanggal_mulai?: string;

  @IsOptional()
  @IsString()
  tanggal_selesai?: string;

  @IsOptional()
  @Transform(({ value }) => {
    // Parsing string JSON dari form-data menjadi object/array beneran
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFaseWithKegiatansDto)
  fases?: CreateFaseWithKegiatansDto[];
}
