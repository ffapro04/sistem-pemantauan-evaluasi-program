/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Termin } from './termin.entity';

export enum PersyaratanStatus {
  WAITING_UPLOAD = 'WAITING_UPLOAD',
  WAITING_AO = 'WAITING_AO',
  WAITING_HO = 'WAITING_HO',
  APPROVED = 'APPROVED',
  REJECTED_AO = 'REJECTED_AO',
  REJECTED_HO = 'REJECTED_HO',
}

@Entity('t_persyaratan_termin')
export class PersyaratanTermin {
  @PrimaryGeneratedColumn()
  id_persyaratan: number;

  @Column()
  id_termin: number;

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

  /** Siapa yang upload */
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

  /** HO approve */
  @Column({ nullable: true })
  approved_by: number;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  /** HO reject + alasan */
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

  @ManyToOne(() => Termin, (termin) => termin.persyaratan, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_termin' })
  termin: Termin;
}
