/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wilayah } from '../../wilayah/entities/wilayah.entity';

@Entity('m_sekolah')
export class Sekolah {
  @PrimaryGeneratedColumn()
  id_sekolah: number;

  @Column()
  nama_sekolah: string;

  @Column()
  jenjang: string;

  @Column()
  id_wilayah: number;

  @Column()
  id_kabupaten: number;

  @Column({ default: true })
  status: boolean;

  @Column({ nullable: true, length: 20 })
  npsn: string;

  @Column({ nullable: true, length: 50 })
  akreditasi: string;

  @Column({ nullable: true, length: 50, default: 'Dasar' })
  akreditasi_internal: string;

  @Column({ default: 0 })
  jumlah_guru: number;

  @Column({ default: 0 })
  jumlah_siswa: number;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column({ nullable: true })
  nama_kabupaten: string;

  @Column({ nullable: true })
  kode_kabupaten: string;

  @Column({ nullable: true })
  area: string;

  @Column({ type: 'int', nullable: true })
  tahun_binaan: number;

  @Column({ nullable: true })
  kriteria_2022: string;

  @Column({ nullable: true })
  sertifikat_iso: string;

  @Column({ nullable: true })
  adiwiyata: string;

  @Column({ type: 'double precision', default: 0 })
  latitude: number;

  @Column({ type: 'double precision', default: 0 })
  longitude: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo_url: string;

  @Column({ unique: true, nullable: true })
  email_login: string;

  @Column({ nullable: true })
  password_login: string;

  @Column({ default: 'sekolah', nullable: true })
  role: string;

  @ManyToOne(() => Wilayah, (wilayah) => wilayah.sekolah, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_wilayah' })
  wilayah: Wilayah;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
