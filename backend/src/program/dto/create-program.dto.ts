/* eslint-disable prettier/prettier */
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateRequirementDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsOptional()
  @IsString()
  tipe?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  urutan?: number;
}

export class CreateTerminDto {
  @IsString()
  @IsNotEmpty()
  nama_termin: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  urutan?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  jumlah_pembayaran?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequirementDto)
  persyaratan?: CreateRequirementDto[];
}

export class CreateKegiatansDto {
  @IsString()
  @IsNotEmpty()
  nama_kegiatans: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  urutan?: number;

  @IsOptional()
  @IsString()
  tanggal_mulai?: string;

  @IsOptional()
  @IsString()
  tanggal_selesai?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequirementDto)
  persyaratan?: CreateRequirementDto[];
}

export class CreateFaseWithKegiatansDto {
  @IsString()
  @IsNotEmpty()
  nama_fase: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  urutan?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTerminDto)
  termin?: CreateTerminDto[];

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
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);

    if (typeof value === 'string' && value.trim() !== '') {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed.map(Number);
        }
      } catch {
        return value.split(',').map((v) => Number(v.trim()));
      }
    }

    if (typeof value === 'number') return [value];

    return [];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  id_vendor?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);

    if (typeof value === 'string' && value.trim() !== '') {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed.map(Number);
        }
      } catch {
        return value.split(',').map((v) => Number(v.trim()));
      }
    }

    if (typeof value === 'number') return [value];

    return [];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  sekolah_ids?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);

    if (typeof value === 'string' && value.trim() !== '') {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed.map(Number);
        }
      } catch {
        return value.split(',').map((v) => Number(v.trim()));
      }
    }

    if (typeof value === 'number') return [value];

    return [];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  ao_ids?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);

    if (typeof value === 'string' && value.trim() !== '') {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed.map(Number);
        }
      } catch {
        return value.split(',').map((v) => Number(v.trim()));
      }
    }

    if (typeof value === 'number') return [value];

    return [];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  vendor_ids?: number[];

  @IsOptional()
  file_mou?: any;

  /**
   * Kategori utama:
   * - AKADEMIK
   * - NON_AKADEMIK
   */
  @IsString()
  @IsNotEmpty()
  kategori: string;

  /**
   * Penanda 4 Pilar:
   * - AKADEMIK
   * - KARAKTER
   * - SENI_BUDAYA
   * - KECAKAPAN_HIDUP
   *
   * Sementara optional agar proses lama tidak langsung rusak
   * sebelum frontend selesai diperbarui.
   */
  @IsOptional()
  @IsString()
  @IsIn(['AKADEMIK', 'KARAKTER', 'SENI_BUDAYA', 'KECAKAPAN_HIDUP'])
  pilar_program?: string;

  /**
   * Jenis program:
   * - PROJECT
   * - REGULER
   */
  @IsOptional()
  @IsString()
  @IsIn(['PROJECT', 'REGULER'])
  jenis_program?: string;

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
  @IsString()
  nomor_mou?: string;

  @IsOptional()
  harga_vendor?: any;

  @IsOptional()
  @IsString()
  kpi_nama?: string;

  @IsOptional()
  kpi_target?: any;

  @IsOptional()
  @IsString()
  kpi_satuan?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;

    if (typeof value === 'string' && value.trim() !== '') {
      try {
        const parsed = JSON.parse(value);

        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFaseWithKegiatansDto)
  fases?: CreateFaseWithKegiatansDto[];
}
