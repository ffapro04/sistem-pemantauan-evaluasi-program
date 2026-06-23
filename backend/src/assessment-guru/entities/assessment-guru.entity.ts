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

import { Kelas } from '../../kelas/entities/kelas.entity';
import { Jurusan } from '../../jurusan/entities/jurusan.entity';

@Entity('assessment_guru')
export class AssessmentGuru {
  @PrimaryGeneratedColumn()
  id_guru_assessment: number;

  @Column()
  id_sekolah: number;

  @Column({ type: 'varchar', length: 150 })
  nama_guru: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email_guru: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  no_telepon: string;

  // Guru Kelas / Guru Bidang Studi / Produktif / Adaptif / Normatif
  @Column({ type: 'varchar', length: 50, nullable: true })
  jenis_guru: string;

  // SD/SMP/SMK: mata pelajaran utama guru
  @Column({ type: 'varchar', length: 100, nullable: true })
  mata_pelajaran: string;

  // Wali kelas opsional, ambil dari master kelas
  @Column({ type: 'int', nullable: true })
  id_kelas: number | null;

  @ManyToOne(() => Kelas, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_kelas', referencedColumnName: 'id_kelas' })
  kelas_data: Kelas | null;

  // Jurusan opsional, khusus SMK, ambil dari master jurusan
  @Column({ type: 'int', nullable: true })
  id_jurusan: number | null;

  @ManyToOne(() => Jurusan, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_jurusan', referencedColumnName: 'id_jurusan' })
  jurusan_data: Jurusan | null;

  // Legacy text, tetap dipertahankan agar data lama tidak rusak
  @Column({ type: 'varchar', length: 100, nullable: true })
  kelas_wali: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  jurusan: string;

  // Legacy, tidak dipakai lagi di tabel Daftar Guru karena diganti Mata Pelajaran
  @Column({ type: 'varchar', length: 50, nullable: true })
  nip: string;

  @Column({ type: 'text' })
  password_hash: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
