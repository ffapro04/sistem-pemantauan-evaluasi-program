/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../roles/role.entity';
import { Wilayah } from '../wilayah/entities/wilayah.entity';
import { Sekolah } from '../sekolah/entities/sekolah.entity';

@Entity('m_users')
export class User {
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column()
  nama: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  jabatan: string;

  @Column({ nullable: true })
  no_telp: string;

  @Column({ nullable: true })
  jenis: string;

  @Column({ type: 'jsonb', nullable: true })
  kabupaten_tugas: any[];

  @Column({ nullable: true })
  sub_jenis: string;

  @Column({ nullable: true })
  foto_profile: string;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'id_role' })
  role: Role;

  @RelationId((user: User) => user.role)
  id_role: number;

  @OneToMany(() => Wilayah, (wilayah) => wilayah.user)
  wilayah: Wilayah[];

  @ManyToOne(() => Sekolah, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_sekolah' })
  sekolah: Sekolah;

  @RelationId((user: User) => user.sekolah)
  id_sekolah: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
