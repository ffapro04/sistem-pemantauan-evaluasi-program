/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Termin } from './termin.entity';

@Entity('t_termin_chat')
export class TerminChat {
  @PrimaryGeneratedColumn()
  id_chat: number;

  @Column({ type: 'text' })
  pesan: string;

  @Column()
  id_user: number;

  @Column({ nullable: true })
  nama_user: string;

  @Column({ nullable: true })
  role_user: string;

  @Column({ nullable: true })
  id_program: number;

  @Column({ nullable: true })
  id_fase: number;

  @Column({ nullable: true })
  id_termin: number;

  @Column({ nullable: true })
  id_kegiatans: number;

  @Column({ nullable: true })
  id_persyaratan: number;

  @Column({ nullable: true })
  konteks: string;

  @ManyToOne(() => Termin, (termin) => termin.chats, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'id_termin' })
  termin: Termin;

  @CreateDateColumn()
  created_at: Date;
}
