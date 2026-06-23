/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth-guard';
import { NotificationRecipientType } from './entities/notifikasi.entity';
import { NotifikasiService } from './notifikasi.service';

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

function getNotificationIdentity(req: any, authHeader?: string) {
  const tokenPayload = decodeJwtPayload(authHeader);
  const guardUser = req?.user?.user ?? req?.user ?? {};

  const roleId = Number(
    tokenPayload?.id_role ??
      tokenPayload?.role_id ??
      guardUser?.id_role ??
      guardUser?.role_id ??
      0,
  );

  const roleText = String(
    tokenPayload?.role ??
      tokenPayload?.nama_role ??
      guardUser?.role ??
      guardUser?.nama_role ??
      '',
  ).toLowerCase();

  const isGuruAssessment =
    roleId === 8 ||
    roleText.includes('guru assessment') ||
    tokenPayload?.type === 'guru-assessment';

  const recipientId = Number(
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

  if (!recipientId) {
    throw new UnauthorizedException(
      'Identitas akun dari token tidak ditemukan',
    );
  }

  return {
    recipientType: isGuruAssessment
      ? NotificationRecipientType.GURU_ASSESSMENT
      : NotificationRecipientType.USER,
    recipientId,
  };
}

@Controller('notifikasi')
@UseGuards(JwtAuthGuard)
export class NotifikasiController {
  constructor(private readonly notifikasiService: NotifikasiService) {}

  // Route utama yang dipakai Sidebar baru.
  @Get('me')
  findMine(@Req() req: any, @Headers('authorization') authHeader: string) {
    return this.notifikasiService.findMine(
      getNotificationIdentity(req, authHeader),
    );
  }

  @Get('me/unread-count')
  unreadCountMine(
    @Req() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.notifikasiService.unreadCount(
      getNotificationIdentity(req, authHeader),
    );
  }

  // Alias lama agar pemanggilan frontend yang belum diganti tetap aman.
  @Get()
  findMineLegacy(
    @Req() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.findMine(req, authHeader);
  }

  @Get('unread-count')
  unreadCountLegacy(
    @Req() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.unreadCountMine(req, authHeader);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: any, @Headers('authorization') authHeader: string) {
    return this.notifikasiService.markAllAsRead(
      getNotificationIdentity(req, authHeader),
    );
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.notifikasiService.markAsRead(
      id,
      getNotificationIdentity(req, authHeader),
    );
  }
}
