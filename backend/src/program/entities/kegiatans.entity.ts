/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Fase } from './fase.entity';
import { Termin } from './termin.entity';
import { PersyaratanKegiatan } from './persyaratan-kegiatan.entity';
import { KegiatanComment } from './kegiatan-comment.entity';
import { KegiatanPertemuan } from './kegiatan-pertemuan.entity';
import { KegiatanRating } from './kegiatan-rating.entity';

@Entity('t_kegiatans')
export class Kegiatans {
  @PrimaryGeneratedColumn()
  id_kegiatans: number;

  @Column()
  nama_kegiatans: string;

  @Column({ nullable: true })
  deskripsi: string;

  @Column()
  urutan: number;

  @Column({ type: 'date', nullable: true })
  tanggal_mulai: Date;

  @Column({ type: 'date', nullable: true })
  tanggal_selesai: Date;

  @Column()
  id_fase: number;

  // Status kegiatan: LOCKED | UNLOCKED | IN_PROGRESS | WAITING_HO | APPROVED | REJECTED
  @Column({ default: 'LOCKED' })
  status_kegiatan: string;

  // Rating dari Guru (1-5) setelah kegiatan APPROVED
  @Column({ type: 'int', nullable: true })
  guru_rating: number;

  @Column({ type: 'text', nullable: true })
  guru_comment: string;

  @Column({ nullable: true })
  guru_rated_by: number;

  @Column({ type: 'timestamp', nullable: true })
  guru_rated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Fase, (fase) => fase.kegiatans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_fase' })
  fase: Fase;

  @OneToMany(() => Termin, (termin) => termin.kegiatans)
  termin: Termin[];

  @OneToMany(() => PersyaratanKegiatan, (persyaratan) => persyaratan.kegiatan)
  persyaratan: PersyaratanKegiatan[];

  @OneToMany(() => KegiatanComment, (comment) => comment.kegiatan)
  comments: KegiatanComment[];

  @OneToMany(() => KegiatanPertemuan, (pertemuan) => pertemuan.kegiatan)
  pertemuan: KegiatanPertemuan[];

  @OneToMany(() => KegiatanRating, (rating) => rating.kegiatan)
  ratings: KegiatanRating[];
}
