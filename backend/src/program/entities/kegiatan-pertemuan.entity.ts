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

@Entity('t_kegiatan_pertemuan')
export class KegiatanPertemuan {
  @PrimaryGeneratedColumn()
  id_pertemuan: number;

  @Column()
  id_kegiatans: number;

  @Column({ length: 180 })
  nama_pertemuan: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ type: 'date', nullable: true })
  tanggal_mulai: Date;

  @Column({ type: 'date', nullable: true })
  tanggal_selesai: Date;

  @Column({ default: 1 })
  urutan: number;

  @Column({ default: 'PLANNED', length: 40 })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Kegiatans, (kegiatan) => kegiatan.pertemuan, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_kegiatans' })
  kegiatan: Kegiatans;
}
