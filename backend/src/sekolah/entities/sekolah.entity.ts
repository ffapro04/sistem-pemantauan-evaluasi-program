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

 @ManyToOne(() => Wilayah, (wilayah) => wilayah.sekolah)
@JoinColumn({ name: 'id_wilayah' }) // Ini mengaitkan relasi ke kolom di atas
wilayah: Wilayah;


  @Column({ default: true })
  status: boolean;

  @Column({ nullable: true, length: 20 })
  npsn: string;

  @Column({ nullable: true, length: 5 })
  akreditasi: string;

  @Column({ default: 0 })
  jumlah_guru: number;

  @Column({ default: 0 })
  jumlah_siswa: number;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column({ type: 'varchar', nullable: true })
  latitude: string | number;

  @Column({ type: 'varchar', nullable: true })
  longitude: string | number;

  // REVISI DI SINI: Tambahkan nullable: true agar data lama tidak error
  @Column({ unique: true, nullable: true })
  email_login: string;

  @Column({ nullable: true }) // Hapus select: false
  password_login: string;
  // REVISI DI SINI: Tambahkan nullable: true
  @Column({ default: 'sekolah', nullable: true })
  role: string;

  @ManyToOne(() => Wilayah, (wilayah) => wilayah.sekolah, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })


  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
