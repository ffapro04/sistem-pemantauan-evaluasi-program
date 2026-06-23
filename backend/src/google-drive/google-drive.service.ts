/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google } from 'googleapis';
import * as crypto from 'crypto';
import { Readable } from 'stream';

import { UserGoogleDriveToken } from './entities/user-google-drive-token.entity';
import { GoogleDriveFile } from './entities/google-drive-file.entity';

@Injectable()
export class GoogleDriveService {
  private readonly scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  constructor(
    @InjectRepository(UserGoogleDriveToken)
    private readonly tokenRepo: Repository<UserGoogleDriveToken>,

    @InjectRepository(GoogleDriveFile)
    private readonly fileRepo: Repository<GoogleDriveFile>,
  ) {}

  private getOAuthClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException(
        'Konfigurasi Google Drive belum lengkap di file .env.',
      );
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  private getOwnerTypeByRole(idRole?: number | null) {
    const role = Number(idRole);

    if (role === 1) return 'ADMIN';
    if (role === 2) return 'PENGURUS';
    if (role === 3) return 'HEAD_OFFICE';
    if (role === 4) return 'AREA_OFFICER';
    if (role === 5) return 'SEKOLAH';
    if (role === 6) return 'VENDOR';
    if (role === 7) return 'KEPALA_DINAS';
    if (role === 8) return 'GURU_ASSESSMENT';

    return 'USER';
  }

  private createState(payload: Record<string, any>) {
    const secret =
      process.env.OAUTH_STATE_SECRET || 'default_drive_state_secret';

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );

    const signature = crypto
      .createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64url');

    return `${encodedPayload}.${signature}`;
  }

  private verifyState(state: string) {
    const secret =
      process.env.OAUTH_STATE_SECRET || 'default_drive_state_secret';

    const [encodedPayload, signature] = String(state || '').split('.');

    if (!encodedPayload || !signature) {
      throw new BadRequestException('State OAuth tidak valid.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new BadRequestException('State OAuth tidak cocok.');
    }

    try {
      return JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      );
    } catch {
      throw new BadRequestException('Payload OAuth tidak valid.');
    }
  }

  async getAuthUrl(params: {
    idUser: number;
    idRole?: number | null;
    redirectTo?: string;
  }) {
    const oauth2Client = this.getOAuthClient();
    const ownerType = this.getOwnerTypeByRole(params.idRole);

    const state = this.createState({
      id_user: params.idUser,
      id_role: params.idRole || null,
      owner_type: ownerType,
      redirect_to: params.redirectTo || '/login?drive=connected',
      created_at: Date.now(),
    });

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: this.scopes,
      include_granted_scopes: true,
      state,
    });

    return {
      url,
      owner_type: ownerType,
    };
  }

  async handleCallback(code: string, state: string) {
    if (!code) {
      throw new BadRequestException('Code Google OAuth tidak ditemukan.');
    }

    const payload = this.verifyState(state);

    const idUser = Number(payload.id_user);
    const idRole = payload.id_role ? Number(payload.id_role) : null;
    const ownerType = payload.owner_type || this.getOwnerTypeByRole(idRole);

    if (!idUser) {
      throw new BadRequestException('User OAuth tidak valid.');
    }

    const oauth2Client = this.getOAuthClient();

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      throw new BadRequestException(
        'Refresh token Google tidak diterima. Coba hubungkan ulang Google Drive.',
      );
    }

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      version: 'v2',
      auth: oauth2Client,
    });

    const profile = await oauth2.userinfo.get();

    await this.tokenRepo.update(
      {
        id_user: idUser,
        is_active: true,
      },
      {
        is_active: false,
      },
    );

    const savedToken = await this.tokenRepo.save(
      this.tokenRepo.create({
        id_user: idUser,
        id_role: idRole,
        owner_type: ownerType,
        google_email: profile.data.email || null,
        google_name: profile.data.name || null,
        access_token: tokens.access_token || null,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date || null,
        scope: tokens.scope || null,
        is_active: true,
      }),
    );

    return {
      connected: true,
      id_user: savedToken.id_user,
      id_role: savedToken.id_role,
      owner_type: savedToken.owner_type,
      google_email: savedToken.google_email,
      google_name: savedToken.google_name,
      redirect_to: payload.redirect_to || '/login?drive=connected',
    };
  }

  async getStatus(idUser: number) {
    const token = await this.tokenRepo.findOne({
      where: {
        id_user: idUser,
        is_active: true,
      },
      order: {
        id: 'DESC',
      },
    });

    if (!token) {
      return {
        connected: false,
        google_email: null,
        google_name: null,
        owner_type: null,
      };
    }

    return {
      connected: true,
      google_email: token.google_email,
      google_name: token.google_name,
      owner_type: token.owner_type,
      connected_at: token.created_at,
    };
  }

  async disconnect(idUser: number) {
    await this.tokenRepo.update(
      {
        id_user: idUser,
        is_active: true,
      },
      {
        is_active: false,
      },
    );

    return {
      disconnected: true,
      message: 'Koneksi Google Drive berhasil diputuskan.',
    };
  }

  async getActiveOAuthClientByUser(idUser: number) {
    const token = await this.tokenRepo.findOne({
      where: {
        id_user: idUser,
        is_active: true,
      },
      order: {
        id: 'DESC',
      },
    });

    if (!token) {
      throw new UnauthorizedException(
        'Google Drive belum terhubung. Silakan hubungkan Google Drive terlebih dahulu.',
      );
    }

    const oauth2Client = this.getOAuthClient();

    oauth2Client.setCredentials({
      refresh_token: token.refresh_token,
      access_token: token.access_token || undefined,
      expiry_date: token.expiry_date || undefined,
    });

    return oauth2Client;
  }

  private bufferToStream(buffer: Buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  private async getOrCreateFolder(params: {
    drive: any;
    folderName: string;
  }): Promise<string | null> {
    const safeFolderName = params.folderName.replace(/'/g, "\\'");

    const existing = await params.drive.files.list({
      q: `name='${safeFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
      pageSize: 1,
    });

    const existingFolder = existing.data.files?.[0];

    if (existingFolder?.id) {
      return existingFolder.id;
    }

    const created = await params.drive.files.create({
      requestBody: {
        name: params.folderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    return created.data.id || null;
  }

  async uploadFile(params: {
    idUser: number;
    idRole?: number | null;
    file: any;
    moduleType: string;
    relatedTable?: string | null;
    relatedId?: number | null;
  }) {
    if (!params.file) {
      throw new BadRequestException('File upload tidak ditemukan.');
    }

    const auth = await this.getActiveOAuthClientByUser(params.idUser);

    const drive = google.drive({
      version: 'v3',
      auth,
    });

    const folderId = await this.getOrCreateFolder({
      drive,
      folderName: 'Sistem Monitoring Evaluasi YPA-MDR',
    });

    const uploaded = await drive.files.create({
      requestBody: {
        name: params.file.originalname,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType: params.file.mimetype,
        body: this.bufferToStream(params.file.buffer),
      },
      fields: 'id, name, mimeType, size, webViewLink, webContentLink',
    });

    const data = uploaded.data;

    if (!data.id) {
      throw new BadRequestException('Upload ke Google Drive gagal.');
    }

    const savedFile = await this.fileRepo.save(
      this.fileRepo.create({
        id_user: params.idUser,
        id_role: params.idRole || null,
        module_type: params.moduleType,
        related_table: params.relatedTable || null,
        related_id: params.relatedId || null,
        drive_file_id: data.id,
        drive_folder_id: folderId || null,
        original_name: data.name || params.file.originalname,
        mime_type: data.mimeType || params.file.mimetype,
        size_bytes: data.size ? Number(data.size) : params.file.size || null,
        web_view_link: data.webViewLink || null,
        web_content_link: data.webContentLink || null,
      }),
    );

    return {
      uploaded: true,
      file: savedFile,
    };
  }
}
