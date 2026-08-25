/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Kegiatans } from './kegiatans.entity';
import { PersyaratanStatus } from './persyaratan-termin.entity';

@Entity('t_persyaratan_kegiatan')
export class PersyaratanKegiatan {
  @PrimaryGeneratedColumn()
  id_persyaratan: number;

  @Column()
  id_kegiatans: number;

  @Column()
  nama: string;

  @Column({ default: 'upload' })
  tipe: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ default: 1 })
  urutan: number;

  @Column({ default: PersyaratanStatus.WAITING_UPLOAD })
  status: PersyaratanStatus;

  @Column({ type: 'text', nullable: true })
  file_path: string;

  @Column({ nullable: true })
  nama_file: string;

  /** Siapa yang mengupload (id_user) */
  @Column({ nullable: true })
  uploaded_by: number;

  @Column({ type: 'timestamp', nullable: true })
  uploaded_at: Date;

  /** AO yang menyetujui dan meneruskan ke HO */
  @Column({ nullable: true })
  ao_reviewed_by: number;

  @Column({ type: 'timestamp', nullable: true })
  ao_reviewed_at: Date;

  /** AO yang menolak upload */
  @Column({ nullable: true })
  ao_rejected_by: number;

  @Column({ type: 'timestamp', nullable: true })
  ao_rejected_at: Date;

  @Column({ type: 'text', nullable: true })
  ao_rejected_reason: string;

  /** HO yang approve */
  @Column({ nullable: true })
  approved_by: number;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  /** HO yang reject + alasan */
  @Column({ nullable: true })
  rejected_by: number;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date;

  @Column({ type: 'text', nullable: true })
  rejected_reason: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @ManyToOne(() => Kegiatans, (kegiatan) => kegiatan.persyaratan, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_kegiatans' })
  kegiatan: Kegiatans;
}
