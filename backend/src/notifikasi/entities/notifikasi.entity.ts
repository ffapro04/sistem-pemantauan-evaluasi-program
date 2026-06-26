/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NotificationRecipientType {
  USER = 'USER',
  GURU_ASSESSMENT = 'GURU_ASSESSMENT',
}

@Entity('notifikasi')
@Index('IDX_notifikasi_recipient', [
  'recipient_type',
  'recipient_id',
  'is_read',
  'created_at',
])
export class Notifikasi {
  @PrimaryGeneratedColumn()
  id_notifikasi: number;

  /**
   * Kolom lama. Tetap dipertahankan supaya notifikasi lama dan pemanggil
   * service lama yang menggunakan id_user tidak langsung rusak.
   */
  @Column({ type: 'int', nullable: true })
  id_user: number | null;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    default: NotificationRecipientType.USER,
  })
  recipient_type: NotificationRecipientType | null;

  @Column({ type: 'int', nullable: true })
  recipient_id: number | null;

  @Column({ type: 'varchar', length: 150 })
  judul: string;

  @Column({ type: 'text' })
  pesan: string;

  @Column({ type: 'varchar', length: 50 })
  tipe: string;

  @Column({ type: 'text', nullable: true })
  target_url: string | null;

  @Column({ type: 'int', nullable: true })
  id_agenda: number | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  dedupe_key: string | null;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
