/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
  IsIn,
} from 'class-validator';
import {
  AdminAgendaStatus,
  AdminAgendaVisibilityScope,
} from '../entities/admin-agenda.entity';
import { AdminAgendaParticipantType } from '../entities/admin-agenda-participant.entity';

export class AdminAgendaParticipantDto {
  @IsEnum(AdminAgendaParticipantType)
  participant_type: AdminAgendaParticipantType;

  @Type(() => Number)
  @IsInt()
  participant_id: number;
}

export class CreateAdminAgendaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsDateString()
  agenda_date: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/)
  start_time?: string | null;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/)
  end_time?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  location?: string | null;

  @IsOptional()
  @IsString()
  @IsIn(['AKADEMIK', 'KARAKTER', 'SENI_BUDAYA', 'KECAKAPAN_HIDUP'])
  pilar?: string | null;

  @IsOptional()
  @IsString()
  @IsIn(['INDOOR', 'OUTDOOR', 'DARING'])
  activity_type?: string | null;

  @IsOptional()
  @IsString()
  meeting_link?: string | null;

  @IsOptional()
  @IsArray()
  jenjang_targets?: string[] | null;

  @IsOptional()
  @IsArray()
  wilayah_targets?: number[] | null;

  @IsOptional()
  @IsEnum(AdminAgendaStatus)
  status?: AdminAgendaStatus;

  @IsOptional()
  @IsEnum(AdminAgendaVisibilityScope)
  visibility_scope?: AdminAgendaVisibilityScope;

  @IsOptional()
  @IsString()
  status_note?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminAgendaParticipantDto)
  participants: AdminAgendaParticipantDto[];
}
