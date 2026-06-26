/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kegiatans } from './kegiatans.entity';

@Entity('t_kegiatan_rating')
export class KegiatanRating {
  @PrimaryGeneratedColumn()
  id_rating: number;

  @Column()
  id_kegiatans: number;

  @Column({ length: 30 })
  rater_type: string;

  @Column({ nullable: true })
  id_user: number;

  @Column({ nullable: true })
  id_guru_assessment: number;

  @Column({ nullable: true })
  id_vendor: number;

  @Column({ nullable: true })
  id_sekolah: number;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  komentar: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Kegiatans, (kegiatan) => kegiatan.ratings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_kegiatans' })
  kegiatan: Kegiatans;
}
