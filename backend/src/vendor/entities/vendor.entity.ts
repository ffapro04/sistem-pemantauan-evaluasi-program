/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('m_vendor')
export class Vendor {
  @PrimaryGeneratedColumn()
  id_vendor: number;

  @Column()
  nama_vendor: string;

  @Column({ nullable: true })
  no_register: string;

  @Column({ nullable: true })
  npwp_file: string;

  @Column({ nullable: true })
  buku_rekening_file: string;

  @Column({ nullable: true })
  pj_1: string;

  @Column({ nullable: true })
  telp_pj_1: string;

  @Column({ nullable: true })
  pj_2: string;

  @Column({ nullable: true })
  telp_pj_2: string;

  @Column({ nullable: true })
  ktp_pj_file: string;

  @Column({ nullable: true })
  akta_notaris_file: string;

  @Column({ nullable: true })
  pilar: string;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column({ default: 'Bermitra' })
  status: string;

  @OneToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column({ nullable: true })
  id_user: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
