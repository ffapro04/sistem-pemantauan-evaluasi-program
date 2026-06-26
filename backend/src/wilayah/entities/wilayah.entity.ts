/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Sekolah } from '../../sekolah/entities/sekolah.entity';

@Entity('m_wilayah')
export class Wilayah {
  @PrimaryGeneratedColumn({ name: 'id_wilayah' })
  id_wilayah: number;

  @Column({ nullable: true })
  kode_wilayah: string;

  @Column({ unique: true })
  nama_wilayah: string;

  @Column({ nullable: true })
  tipe_wilayah: string;

  @Column({ nullable: true })
  jenis_wilayah: string;

  @Column({ nullable: true })
  area_wilayah: string;

  @Column({ nullable: true })
  deskripsi: string;

  @Column({ type: 'text', nullable: true })
  alamat_lengkap: string;

  @Column({ nullable: true })
  luas_wilayah: string;

  @Column({ type: 'text', nullable: true })
  letak_geografis: string;

  @Column({ type: 'text', nullable: true })
  letak_astronomis: string;

  @Column({ type: 'jsonb', nullable: true })
  bounds: number[][];

  @Column({ default: true })
  status: boolean;

  @Column({ nullable: true })
  tahun_awal_binaan: number;

  @Column({ default: 0 })
  jumlah_sd: number;

  @Column({ default: 0 })
  jumlah_smp: number;

  @Column({ default: 0 })
  jumlah_smk: number;

  @Column({ default: 0 })
  jumlah_guru: number;

  @Column({ default: 0 })
  jumlah_siswa: number;

  @ManyToOne(() => User, (user) => user.wilayah, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column({ nullable: true, name: 'id_parent' })
  id_parent: number;

  @ManyToOne(() => Wilayah, (wilayah) => wilayah.children, { nullable: true })
  @JoinColumn({ name: 'id_parent' })
  parent: Wilayah;

  @OneToMany(() => Wilayah, (wilayah) => wilayah.parent)
  children: Wilayah[];

  @OneToMany(() => Sekolah, (sekolah) => sekolah.wilayah)
  sekolah: Sekolah[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) =>
        value === null || value === undefined ? null : parseFloat(value),
    },
  })
  latitude: number;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) =>
        value === null || value === undefined ? null : parseFloat(value),
    },
  })
  longitude: number;
}
