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
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';
// 1. TAMBAHKAN IMPORT INI DI ATAS
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
  deskripsi: string;

  @Column({ type: 'text', nullable: true })
  alamat_lengkap: string;

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

  // --- 2. TAMBAHKAN INI (DI SINI TEMPATNYA) ---
  // Ini yang bikin error "Property sekolah does not exist" jadi ILANG
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
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  latitude: number;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  longitude: number;
}
