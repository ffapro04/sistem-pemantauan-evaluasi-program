/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminAgendaDto } from './create-admin-agenda.dto';

export class UpdateAdminAgendaDto extends PartialType(CreateAdminAgendaDto) {}
