/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth-guard';
import { AdminAgendaService, AgendaAuthIdentity } from './admin-agenda.service';
import { CreateAdminAgendaDto } from './dto/create-admin-agenda.dto';
import { UpdateAdminAgendaStatusDto } from './dto/update-admin-agenda-status.dto';
import { UpdateAdminAgendaDto } from './dto/update-admin-agenda.dto';
import { AdminAgendaParticipantType } from './entities/admin-agenda-participant.entity';

function decodeJwtPayload(authHeader?: string) {
  try {
    const token = String(authHeader || '').split(' ')[1];
    const payloadPart = token?.split('.')[1];

    if (!payloadPart) return {};

    return JSON.parse(
      Buffer.from(
        payloadPart.replace(/-/g, '+').replace(/_/g, '/'),
        'base64',
      ).toString('utf8'),
    );
  } catch {
    return {};
  }
}

function resolveRoleId(roleIdRaw: any, roleTextRaw: any) {
  const numericRoleId = Number(roleIdRaw || 0);
  if (numericRoleId) return numericRoleId;

  const roleText = String(roleTextRaw || '').toLowerCase();

  if (roleText.includes('admin')) return 1;
  if (roleText.includes('pengurus')) return 2;
  if (roleText.includes('head office') || roleText === 'ho') return 3;
  if (roleText.includes('area officer') || roleText === 'ao') return 4;
  if (roleText.includes('operator sekolah')) return 9;
  if (roleText.includes('guru assessment')) return 8;
  if (roleText.includes('kepala dinas')) return 7;
  if (roleText.includes('vendor')) return 6;
  if (roleText.includes('sekolah')) return 5;

  return 0;
}

function getIdentity(req: any, authHeader?: string): AgendaAuthIdentity {
  const tokenPayload = decodeJwtPayload(authHeader);
  const guardUser = req?.user?.user ?? req?.user ?? {};

  const roleName = String(
    tokenPayload?.role ??
      tokenPayload?.nama_role ??
      guardUser?.role ??
      guardUser?.nama_role ??
      tokenPayload?.jabatan ??
      '',
  );

  const roleId = resolveRoleId(
    tokenPayload?.id_role ??
      tokenPayload?.role_id ??
      guardUser?.id_role ??
      guardUser?.role_id,
    roleName,
  );

  const isGuruAssessment =
    roleId === 8 ||
    roleName.toLowerCase().includes('guru assessment') ||
    tokenPayload?.type === 'guru-assessment';

  const id = Number(
    isGuruAssessment
      ? (tokenPayload?.id_guru_assessment ??
          guardUser?.id_guru_assessment ??
          tokenPayload?.sub ??
          guardUser?.userId ??
          guardUser?.id)
      : (tokenPayload?.id_user ??
          guardUser?.id_user ??
          tokenPayload?.sub ??
          guardUser?.userId ??
          guardUser?.id),
  );

  if (!id) {
    throw new UnauthorizedException(
      'Identitas akun dari token tidak ditemukan',
    );
  }

  return {
    id,
    roleId,
    roleName,
    recipientType: isGuruAssessment
      ? AdminAgendaParticipantType.GURU_ASSESSMENT
      : AdminAgendaParticipantType.USER,
  };
}

@Controller('admin-agenda')
@UseGuards(JwtAuthGuard)
export class AdminAgendaController {
  constructor(private readonly adminAgendaService: AdminAgendaService) {}

  @Get('mention-options')
  mentionOptions(
    @Req() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.adminAgendaService.getMentionOptions(
      getIdentity(req, authHeader),
    );
  }

  @Get()
  findAll(@Req() req: any, @Headers('authorization') authHeader: string) {
    return this.adminAgendaService.findAll(getIdentity(req, authHeader));
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.adminAgendaService.findOne(id, getIdentity(req, authHeader));
  }

  @Post()
  create(
    @Body() dto: CreateAdminAgendaDto,
    @Req() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.adminAgendaService.create(dto, getIdentity(req, authHeader));
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminAgendaStatusDto,
    @Req() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.adminAgendaService.updateStatus(
      id,
      dto,
      getIdentity(req, authHeader),
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminAgendaDto,
    @Req() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.adminAgendaService.update(
      id,
      dto,
      getIdentity(req, authHeader),
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.adminAgendaService.remove(id, getIdentity(req, authHeader));
  }
}
