/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Kegiatans } from './kegiatans.entity';
import { Fase } from './fase.entity';
import { TerminChat } from './termin-chat.entity';
import { PersyaratanTermin } from './persyaratan-termin.entity';

@Entity('t_termin')
export class Termin {
  @PrimaryGeneratedColumn()
  id_termin: number;

  @Column()
  nama_termin: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  jumlah_pembayaran: number;

  @Column({ name: 'file_dokumentasi', nullable: true })
  file_dokumentasi: string;

  @Column({ name: 'nama_file_dokumentasi', nullable: true })
  nama_file_dokumentasi: string;

  @Column({ default: 'WAITING_UPLOAD' })
  status: string;

  @Column({ nullable: true })
  id_fase: number;

  @Column({ nullable: true })
  id_kegiatans: number;

  @ManyToOne(() => Fase, (fase) => fase.termin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_fase' })
  fase: Fase;

  @ManyToOne(() => Kegiatans, (kegiatans) => kegiatans.termin, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'id_kegiatans' })
  kegiatans: Kegiatans;

  @OneToMany(() => PersyaratanTermin, (persyaratan) => persyaratan.termin)
  persyaratan: PersyaratanTermin[];

  @OneToMany(() => TerminChat, (chat) => chat.termin)
  chats: TerminChat[];

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
