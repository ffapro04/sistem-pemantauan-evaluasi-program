/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, Repository, DataSource } from 'typeorm';
import {
  Notifikasi,
  NotificationRecipientType,
} from './entities/notifikasi.entity';

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
  constructor(
    @InjectRepository(Notifikasi)
    private readonly notifikasiRepo: Repository<Notifikasi>,

    private readonly dataSource: DataSource,
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
