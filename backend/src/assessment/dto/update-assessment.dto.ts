/* eslint-disable prettier/prettier */
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class QuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  options: string[];
}

export class UpdateAssessmentDto {
  @IsString()
  @IsOptional()
  nama?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @IsOptional()
  questions?: QuestionDto[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  target_sekolah_ids?: number[];

  @IsNumber()
  @IsOptional()
  tenggat?: number;

  @IsString()
  @IsOptional()
  jenis?: string;

  @IsString()
  @IsOptional()
  pilar?: string;
}
