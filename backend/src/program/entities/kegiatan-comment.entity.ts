/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Kegiatans } from './kegiatans.entity';

/**
 * Komentar per kegiatan.
 * AO_REVIEW  : AO review sebelum HO approve
 * HO_APPROVAL: HO comment saat approve / reject
 * GURU_RATING: Guru feedback setelah kegiatan APPROVED
 */
@Entity('t_kegiatan_comment')
export class KegiatanComment {
  @PrimaryGeneratedColumn()
  id_comment: number;

  @Column()
  id_kegiatan: number;

  /** Opsional — komentar bisa terikat ke persyaratan spesifik */
  @Column({ nullable: true })
  id_persyaratan: number;

  @Column()
  id_user: number;

  @Column({ length: 150 })
  nama_user: string;

  @Column({ length: 50 })
  role_user: string;

  @Column({ type: 'text' })
  comment_text: string;

  /** AO_REVIEW | HO_APPROVAL | GURU_RATING */
  @Column({ default: 'AO_REVIEW' })
  comment_type: string;

  @Column({ nullable: true })
  attachment_file: string;

  @Column({ nullable: true })
  attachment_original_name: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Kegiatans, (k) => k.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_kegiatan' })
  kegiatan: Kegiatans;
}
