/* eslint-disable prettier/prettier */
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AdminAgendaStatus } from '../entities/admin-agenda.entity';

export class UpdateAdminAgendaStatusDto {
  @IsEnum(AdminAgendaStatus)
  status: AdminAgendaStatus;

  @IsOptional()
  @IsString()
  status_note?: string | null;
}
