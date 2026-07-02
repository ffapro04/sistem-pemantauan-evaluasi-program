/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { GoogleDriveService } from './google-drive.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth-guard';

@Controller('google-drive')
export class GoogleDriveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  private getCurrentUser(req: any) {
    return req?.user?.user ?? req?.user;
  }

  private getCurrentUserId(req: any) {
    const user = this.getCurrentUser(req);
    const idUser =
      user?.id_user ?? user?.id ?? user?.sub ?? user?.user_id ?? null;

    if (!idUser) {
      throw new UnauthorizedException('User login tidak valid.');
    }

    return Number(idUser);
  }

  private getCurrentUserRoleId(req: any) {
    const user = this.getCurrentUser(req);
    const idRole =
      user?.id_role ?? user?.role?.id_role ?? user?.role_id ?? null;

    return idRole ? Number(idRole) : null;
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth-url')
  async getAuthUrl(
    @Req() req: any,
    @Query('redirectTo') redirectTo?: string,
    @Query('provider') provider?: string,
  ) {
    const idUser = this.getCurrentUserId(req);
    const idRole = this.getCurrentUserRoleId(req);

    return this.googleDriveService.getAuthUrl({
      idUser,
      idRole,
      redirectTo: redirectTo || '/login?drive=connected',
      provider,
    });
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const result = await this.googleDriveService.handleCallback(code, state);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectPath = result.redirect_to || '/login?drive=connected';

    const separator = redirectPath.includes('?') ? '&' : '?';

    return res.redirect(
      `${frontendUrl}${redirectPath}${separator}storage=connected`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async status(@Req() req: any) {
    const idUser = this.getCurrentUserId(req);
    return this.googleDriveService.getStatus(idUser);
  }

  @UseGuards(JwtAuthGuard)
  @Post('disconnect')
  async disconnect(@Req() req: any) {
    const idUser = this.getCurrentUserId(req);
    return this.googleDriveService.disconnect(idUser);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('moduleType') moduleType: string,
    @Body('relatedTable') relatedTable?: string,
    @Body('relatedId') relatedId?: string,
  ) {
    const idUser = this.getCurrentUserId(req);
    const idRole = this.getCurrentUserRoleId(req);

    return this.googleDriveService.uploadFile({
      idUser,
      idRole,
      file,
      moduleType: moduleType || 'GENERAL',
      relatedTable: relatedTable || null,
      relatedId: relatedId ? Number(relatedId) : null,
    });
  }
}
