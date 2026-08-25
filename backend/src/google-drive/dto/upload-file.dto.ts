/* eslint-disable prettier/prettier */
import { IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsString()
  moduleType?: string;

  @IsOptional()
  @IsString()
  relatedTable?: string;

  @IsOptional()
  @IsString()
  relatedId?: string;
}
