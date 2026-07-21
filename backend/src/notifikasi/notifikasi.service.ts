/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, Repository, DataSource } from 'typeorm';
import {
  Notifikasi,
  NotificationRecipientType,
} from './entities/notifikasi.entity';
import { EmailService } from '../auth/email.service';

export type NotificationIdentity = {
  recipientType: NotificationRecipientType;
  recipientId: number;
};

type LegacyCreateNotificationPayload = {
  id_user: number;
  judul: string;
  pesan: string;
  tipe: string;
  target_url?: string;
  id_agenda?: number;
  metadata?: Record<string, any>;
  dedupe_key?: string;
};

export type CreateNotificationRow = {
  recipientType: NotificationRecipientType;
  recipientId: number;
  legacyUserId?: number | null;
  judul: string;
  pesan: string;
  tipe: string;
  targetUrl?: string | null;
  idAgenda?: number | null;
  metadata?: Record<string, any> | null;
  dedupeKey?: string | null;
};

@Injectable()
export class NotifikasiService {
  private readonly logger = new Logger(NotifikasiService.name);
  private deliveryLogReady = false;

  constructor(
    @InjectRepository(Notifikasi)
    private readonly notifikasiRepo: Repository<Notifikasi>,

    private readonly dataSource: DataSource,

    private readonly emailService: EmailService,
  ) {}

  private normalizeIdentity(
    identity: NotificationIdentity | number,
  ): NotificationIdentity {
    if (typeof identity === 'number') {
      if (!identity) {
        throw new BadRequestException(
          'Identitas penerima notifikasi tidak valid',
        );
      }

      return {
        recipientType: NotificationRecipientType.USER,
        recipientId: Number(identity),
      };
    }

    const recipientId = Number(identity?.recipientId || 0);

    if (!recipientId) {
      throw new BadRequestException(
        'Identitas penerima notifikasi tidak valid',
      );
    }

    return {
      recipientType: identity?.recipientType || NotificationRecipientType.USER,
      recipientId,
    };
  }

  private applyIdentity(
    query: any,
    identityInput: NotificationIdentity | number,
  ) {
    const identity = this.normalizeIdentity(identityInput);

    query.andWhere(
      new Brackets((where) => {
        where.where(
          'notifikasi.recipient_type = :recipientType AND notifikasi.recipient_id = :recipientId',
          identity,
        );

        // Kompatibilitas dengan baris notifikasi lama yang hanya mempunyai id_user.
        if (identity.recipientType === NotificationRecipientType.USER) {
          where.orWhere('notifikasi.id_user = :legacyUserId', {
            legacyUserId: identity.recipientId,
          });
        }
      }),
    );

    return query;
  }

  /**
   * Tetap mendukung signature lama agar module lain yang sudah memakai
   * notifikasiService.create({ id_user, ... }) tidak rusak.
   */
  async create(payload: LegacyCreateNotificationPayload) {
    const idUser = Number(payload.id_user || 0);

    if (!idUser) {
      throw new BadRequestException('id_user notifikasi tidak valid');
    }

    const notifikasi = this.notifikasiRepo.create({
      id_user: idUser,
      recipient_type: NotificationRecipientType.USER,
      recipient_id: idUser,
      judul: payload.judul,
      pesan: payload.pesan,
      tipe: payload.tipe,
      target_url: payload.target_url || null,
      id_agenda: payload.id_agenda || null,
      metadata: payload.metadata || null,
      dedupe_key: payload.dedupe_key || null,
      is_read: false,
    });

    if (payload.dedupe_key) {
      const existing = await this.notifikasiRepo.findOne({
        where: { dedupe_key: payload.dedupe_key },
      });

      if (existing) return existing;
    }

    return this.notifikasiRepo.save(notifikasi);
  }

  async createMany(rows: CreateNotificationRow[], manager?: EntityManager) {
    if (!rows.length) return [];

    const repository = manager
      ? manager.getRepository(Notifikasi)
      : this.notifikasiRepo;

    const dedupeKeys = rows
      .map((row) => row.dedupeKey)
      .filter((key): key is string => Boolean(key));

    const existingKeys = new Set<string>();

    if (dedupeKeys.length > 0) {
      const existingRows = await repository
        .createQueryBuilder('notifikasi')
        .select('notifikasi.dedupe_key', 'dedupe_key')
        .where('notifikasi.dedupe_key IN (:...dedupeKeys)', { dedupeKeys })
        .getRawMany<{ dedupe_key: string }>();

      existingRows.forEach((row) => {
        if (row.dedupe_key) existingKeys.add(row.dedupe_key);
      });
    }

    const entities = rows
      .filter((row) => !row.dedupeKey || !existingKeys.has(row.dedupeKey))
      .map((row) => {
      const recipientId = Number(row.recipientId || 0);

      if (!recipientId) {
        throw new BadRequestException('Penerima notifikasi tidak valid');
      }

      return repository.create({
        id_user:
          row.legacyUserId ??
          (row.recipientType === NotificationRecipientType.USER
            ? recipientId
            : null),
        recipient_type: row.recipientType,
        recipient_id: recipientId,
        judul: row.judul,
        pesan: row.pesan,
        tipe: row.tipe,
        target_url: row.targetUrl || null,
        id_agenda: row.idAgenda || null,
        metadata: row.metadata || null,
        dedupe_key: row.dedupeKey || null,
        is_read: false,
      });
    });

    if (!entities.length) return [];

    return repository.save(entities);
  }

  async dispatchMany(rows: CreateNotificationRow[], manager?: EntityManager) {
    const created = await this.createMany(rows, manager);

    if (created.length > 0) {
      this.deliverExternal(created).catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`External notification dispatch failed: ${message}`);
      });
    }

    return created;
  }

  private boolEnv(name: string, fallback = false) {
    const value = process.env[name];
    if (value === undefined || value === null || value === '') return fallback;
    return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
  }

  private emailDeliveryEnabled() {
    return this.boolEnv(
      'NOTIFICATION_EMAIL_ENABLED',
      Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    );
  }

  private whatsappDeliveryEnabled() {
    return this.boolEnv('NOTIFICATION_WHATSAPP_ENABLED', false);
  }

  private getWhatsappProvider() {
    return String(
      process.env.WHATSAPP_PROVIDER ||
        process.env.WHATSAPP_API_PROVIDER ||
        'disabled',
    )
      .trim()
      .toLowerCase();
  }

  private getFrontendUrl() {
    return String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(
      /\/+$/,
      '',
    );
  }

  private buildActionUrl(targetUrl?: string | null) {
    const target = String(targetUrl || '').trim();
    if (!target) return this.getFrontendUrl();
    if (/^https?:\/\//i.test(target)) return target;
    return `${this.getFrontendUrl()}/${target.replace(/^\/+/, '')}`;
  }

  private normalizePhone(value?: string | null) {
    let phone = String(value || '').replace(/[^\d+]/g, '');
    if (!phone) return '';
    phone = phone.replace(/^\+/, '');
    if (phone.startsWith('0')) phone = `62${phone.slice(1)}`;
    if (phone.startsWith('8')) phone = `62${phone}`;
    return phone;
  }

  private escapeHtml(value: string) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private buildExternalMessage(
    notification: Notifikasi,
    contactName: string,
  ) {
    const actionUrl = this.buildActionUrl(notification.target_url);
    const greeting = contactName ? `Halo ${contactName},` : 'Halo Bapak/Ibu,';
    const title = notification.judul || 'Notifikasi Sistem';
    const message = notification.pesan || '';

    return {
      actionUrl,
      title,
      text: [
        greeting,
        '',
        title,
        message,
        '',
        'Buka sistem melalui link berikut:',
        actionUrl,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.65;color:#0f172a">
          <p>${this.escapeHtml(greeting)}</p>
          <h2 style="margin:0 0 12px;color:#0AC4E0">${this.escapeHtml(title)}</h2>
          <p>${this.escapeHtml(message)}</p>
          <p style="margin:22px 0">
            <a href="${this.escapeHtml(actionUrl)}" style="display:inline-block;background:#0AC4E0;color:white;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px">Buka Sistem</a>
          </p>
          <p style="font-size:12px;color:#64748b">Jika tombol tidak bisa dibuka, salin link ini:<br>${this.escapeHtml(actionUrl)}</p>
        </div>
      `,
    };
  }

  private async ensureDeliveryLogTable() {
    if (this.deliveryLogReady) return;

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS notification_delivery_log (
        id_delivery BIGSERIAL PRIMARY KEY,
        id_notifikasi INTEGER NULL,
        recipient_type VARCHAR(40) NULL,
        recipient_id INTEGER NULL,
        channel VARCHAR(30) NOT NULL,
        provider VARCHAR(60) NULL,
        target TEXT NULL,
        status VARCHAR(30) NOT NULL,
        error TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notifikasi
      ON notification_delivery_log (id_notifikasi, channel, created_at DESC)
    `);

    this.deliveryLogReady = true;
  }

  private async logDelivery(params: {
    notification?: Notifikasi | null;
    channel: 'EMAIL' | 'WHATSAPP';
    provider?: string | null;
    target?: string | null;
    status: 'SENT' | 'SKIPPED' | 'FAILED';
    error?: string | null;
  }) {
    try {
      await this.ensureDeliveryLogTable();
      await this.dataSource.query(
        `
          INSERT INTO notification_delivery_log (
            id_notifikasi,
            recipient_type,
            recipient_id,
            channel,
            provider,
            target,
            status,
            error
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          params.notification?.id_notifikasi || null,
          params.notification?.recipient_type || null,
          params.notification?.recipient_id || null,
          params.channel,
          params.provider || null,
          params.target || null,
          params.status,
          params.error || null,
        ],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to write notification delivery log: ${message}`);
    }
  }

  private async resolveNotificationContacts(notifications: Notifikasi[]) {
    const userIds = Array.from(
      new Set(
        notifications
          .filter((item) => item.recipient_type === NotificationRecipientType.USER)
          .map((item) => Number(item.recipient_id || item.id_user || 0))
          .filter(Boolean),
      ),
    );

    const guruIds = Array.from(
      new Set(
        notifications
          .filter(
            (item) =>
              item.recipient_type === NotificationRecipientType.GURU_ASSESSMENT,
          )
          .map((item) => Number(item.recipient_id || 0))
          .filter(Boolean),
      ),
    );

    const [users, gurus] = await Promise.all([
      userIds.length
        ? this.dataSource.query(
            `
              SELECT id_user, nama, email, no_telp
              FROM m_users
              WHERE id_user = ANY($1::int[])
                AND COALESCE(status, true) = true
            `,
            [userIds],
          )
        : Promise.resolve([]),
      guruIds.length
        ? this.dataSource.query(
            `
              SELECT id_guru_assessment, nama_guru, email_guru, no_telepon
              FROM assessment_guru
              WHERE id_guru_assessment = ANY($1::int[])
                AND COALESCE(is_active, true) = true
            `,
            [guruIds],
          )
        : Promise.resolve([]),
    ]);

    const contactMap = new Map<
      string,
      { name: string; email: string; phone: string }
    >();

    users.forEach((row: any) => {
      contactMap.set(`${NotificationRecipientType.USER}:${row.id_user}`, {
        name: row.nama || '',
        email: row.email || '',
        phone: row.no_telp || '',
      });
    });

    gurus.forEach((row: any) => {
      contactMap.set(
        `${NotificationRecipientType.GURU_ASSESSMENT}:${row.id_guru_assessment}`,
        {
          name: row.nama_guru || '',
          email: row.email_guru || '',
          phone: row.no_telepon || '',
        },
      );
    });

    return contactMap;
  }

  private async sendNotificationEmail(
    notification: Notifikasi,
    contact: { name: string; email: string; phone: string },
  ) {
    const email = String(contact.email || '').trim().toLowerCase();

    if (!email) {
      await this.logDelivery({
        notification,
        channel: 'EMAIL',
        provider: 'SMTP',
        target: null,
        status: 'SKIPPED',
        error: 'Recipient email is empty',
      });
      return;
    }

    const message = this.buildExternalMessage(notification, contact.name);

    try {
      await this.emailService.sendMail({
        to: email,
        subject: notification.judul || 'Notifikasi Sistem',
        text: message.text,
        html: message.html,
      });

      await this.logDelivery({
        notification,
        channel: 'EMAIL',
        provider: process.env.SMTP_HOST || 'smtp.gmail.com',
        target: email,
        status: 'SENT',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logDelivery({
        notification,
        channel: 'EMAIL',
        provider: process.env.SMTP_HOST || 'smtp.gmail.com',
        target: email,
        status: 'FAILED',
        error: errorMessage,
      });
    }
  }

  private async sendWhatsappViaMeta(params: {
    phone: string;
    notification: Notifikasi;
    message: ReturnType<NotifikasiService['buildExternalMessage']>;
    contactName: string;
  }) {
    const version = process.env.WHATSAPP_META_API_VERSION || 'v20.0';
    const phoneNumberId = process.env.WHATSAPP_META_PHONE_NUMBER_ID || '';
    const token = process.env.WHATSAPP_META_ACCESS_TOKEN || '';

    if (!phoneNumberId || !token) {
      throw new Error(
        'WHATSAPP_META_PHONE_NUMBER_ID atau WHATSAPP_META_ACCESS_TOKEN belum diisi.',
      );
    }

    const endpoint =
      process.env.WHATSAPP_META_API_URL ||
      `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
    const templateName = process.env.WHATSAPP_META_TEMPLATE_NAME || '';
    const languageCode = process.env.WHATSAPP_META_LANGUAGE_CODE || 'id';

    const body = templateName
      ? {
          messaging_product: 'whatsapp',
          to: params.phone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: params.contactName || 'Bapak/Ibu' },
                  { type: 'text', text: params.message.title },
                  { type: 'text', text: params.notification.pesan || '-' },
                  { type: 'text', text: params.message.actionUrl },
                ],
              },
            ],
          },
        }
      : {
          messaging_product: 'whatsapp',
          to: params.phone,
          type: 'text',
          text: {
            preview_url: true,
            body: params.message.text,
          },
        };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }
  }

  private async sendWhatsappViaCustom(params: {
    phone: string;
    notification: Notifikasi;
    message: ReturnType<NotifikasiService['buildExternalMessage']>;
  }) {
    const endpoint = process.env.WHATSAPP_API_URL || '';
    const token = process.env.WHATSAPP_API_TOKEN || '';
    const provider = this.getWhatsappProvider();

    if (!endpoint) {
      throw new Error('WHATSAPP_API_URL belum diisi.');
    }

    const toField =
      process.env.WHATSAPP_API_TO_FIELD ||
      (provider === 'fonnte' ? 'target' : provider === 'wablas' ? 'phone' : 'to');
    const messageField = process.env.WHATSAPP_API_MESSAGE_FIELD || 'message';
    const authHeader = process.env.WHATSAPP_API_AUTH_HEADER || 'Authorization';
    const authPrefix =
      process.env.WHATSAPP_API_AUTH_PREFIX ??
      (provider === 'fonnte' ? '' : 'Bearer ');

    let extra: Record<string, any> = {};
    if (process.env.WHATSAPP_API_EXTRA_JSON) {
      try {
        extra = JSON.parse(process.env.WHATSAPP_API_EXTRA_JSON);
      } catch {
        extra = {};
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers[authHeader] = `${authPrefix}${token}`;
    }

    const response = await fetch(endpoint, {
      method: process.env.WHATSAPP_API_METHOD || 'POST',
      headers,
      body: JSON.stringify({
        ...extra,
        [toField]: params.phone,
        [messageField]: params.message.text,
        title: params.notification.judul,
        action_url: params.message.actionUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }
  }

  private async sendNotificationWhatsapp(
    notification: Notifikasi,
    contact: { name: string; email: string; phone: string },
  ) {
    const phone = this.normalizePhone(contact.phone);
    const provider = this.getWhatsappProvider();

    if (!phone) {
      await this.logDelivery({
        notification,
        channel: 'WHATSAPP',
        provider,
        target: null,
        status: 'SKIPPED',
        error: 'Recipient phone is empty',
      });
      return;
    }

    if (!provider || provider === 'disabled' || provider === 'none') {
      await this.logDelivery({
        notification,
        channel: 'WHATSAPP',
        provider: provider || 'disabled',
        target: phone,
        status: 'SKIPPED',
        error: 'WhatsApp provider is disabled',
      });
      return;
    }

    const message = this.buildExternalMessage(notification, contact.name);

    try {
      if (provider === 'meta') {
        await this.sendWhatsappViaMeta({
          phone,
          notification,
          message,
          contactName: contact.name,
        });
      } else {
        await this.sendWhatsappViaCustom({
          phone,
          notification,
          message,
        });
      }

      await this.logDelivery({
        notification,
        channel: 'WHATSAPP',
        provider,
        target: phone,
        status: 'SENT',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logDelivery({
        notification,
        channel: 'WHATSAPP',
        provider,
        target: phone,
        status: 'FAILED',
        error: errorMessage,
      });
    }
  }

  private async deliverExternal(notifications: Notifikasi[]) {
    const emailEnabled = this.emailDeliveryEnabled();
    const whatsappEnabled = this.whatsappDeliveryEnabled();

    if (!emailEnabled && !whatsappEnabled) return;

    const contacts = await this.resolveNotificationContacts(notifications);

    for (const notification of notifications) {
      const key = `${notification.recipient_type}:${notification.recipient_id}`;
      const contact = contacts.get(key);

      if (!contact) {
        if (emailEnabled) {
          await this.logDelivery({
            notification,
            channel: 'EMAIL',
            provider: 'SMTP',
            status: 'SKIPPED',
            error: 'Recipient contact was not found',
          });
        }

        if (whatsappEnabled) {
          await this.logDelivery({
            notification,
            channel: 'WHATSAPP',
            provider: this.getWhatsappProvider(),
            status: 'SKIPPED',
            error: 'Recipient contact was not found',
          });
        }

        continue;
      }

      if (emailEnabled) {
        await this.sendNotificationEmail(notification, contact);
      }

      if (whatsappEnabled) {
        await this.sendNotificationWhatsapp(notification, contact);
      }
    }
  }

  async findMine(identity: NotificationIdentity | number) {
    const query = this.notifikasiRepo
      .createQueryBuilder('notifikasi')
      .orderBy('notifikasi.created_at', 'DESC')
      .take(100);

    this.applyIdentity(query, identity);

    return query.getMany();
  }

  async unreadCount(identity: NotificationIdentity | number) {
    const query = this.notifikasiRepo
      .createQueryBuilder('notifikasi')
      .andWhere('notifikasi.is_read = false');

    this.applyIdentity(query, identity);

    return {
      count: await query.getCount(),
    };
  }

  async markAsRead(
    idNotifikasi: number,
    identity: NotificationIdentity | number,
  ) {
    const query = this.notifikasiRepo
      .createQueryBuilder('notifikasi')
      .andWhere('notifikasi.id_notifikasi = :idNotifikasi', {
        idNotifikasi,
      });

    this.applyIdentity(query, identity);

    const notifikasi = await query.getOne();

    if (!notifikasi) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    if (!notifikasi.is_read) {
      notifikasi.is_read = true;
      await this.notifikasiRepo.save(notifikasi);
    }

    return notifikasi;
  }

  async markAllAsRead(identity: NotificationIdentity | number) {
    const query = this.notifikasiRepo
      .createQueryBuilder('notifikasi')
      .select('notifikasi.id_notifikasi', 'id_notifikasi')
      .andWhere('notifikasi.is_read = false');

    this.applyIdentity(query, identity);

    const rows = await query.getRawMany<{ id_notifikasi: number }>();
    const ids = rows
      .map((row) => Number(row.id_notifikasi))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (ids.length > 0) {
      await this.notifikasiRepo
        .createQueryBuilder()
        .update(Notifikasi)
        .set({ is_read: true })
        .where('id_notifikasi IN (:...ids)', { ids })
        .execute();
    }

    return {
      message: 'Semua notifikasi berhasil ditandai sebagai dibaca',
      updated: ids.length,
    };
  }

  async notifyAdmins(payload: {
    judul: string;
    pesan: string;
    tipe: string;
    targetUrl?: string | null;
    metadata?: Record<string, any> | null;
    manager?: EntityManager;
  }) {
    const manager = payload.manager;

    const rows = manager
      ? await manager.query(`
    SELECT id_user
    FROM public.m_users
    WHERE id_role = 1
  `)
      : await this.dataSource.query(`
    SELECT id_user
    FROM public.m_users
    WHERE id_role = 1
  `);

    const admins = (rows || [])
      .map((row: any) => Number(row.id_user))
      .filter((id: number) => Number.isFinite(id) && id > 0);

    if (!admins.length) return [];

    return this.createMany(
      admins.map((idUser) => ({
        recipientType: NotificationRecipientType.USER,
        recipientId: idUser,
        legacyUserId: idUser,
        judul: payload.judul,
        pesan: payload.pesan,
        tipe: payload.tipe,
        targetUrl: payload.targetUrl || null,
        metadata: payload.metadata || null,
        dedupeKey: payload.metadata?.dedupeKey || null,
      })),
      manager,
    );
  }
}
