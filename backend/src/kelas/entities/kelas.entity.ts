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

import { Sekolah } from '../../sekolah/entities/sekolah.entity';
import { Jurusan } from '../../jurusan/entities/jurusan.entity';

@Entity('m_kelas')
export class Kelas {
  @PrimaryGeneratedColumn({ name: 'id_kelas' })
  id_kelas: number;

  @Column()
  id_sekolah: number;

  @Column({ nullable: true })
  id_jurusan: number;

  @Column({ type: 'varchar', length: 100 })
  nama_kelas: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tingkat: string;

  /**
   * Field ini dipertahankan untuk kompatibilitas data lama.
   * Untuk sistem baru, sumber utama jurusan adalah id_jurusan.
   * Isi field ini menjadi snapshot kode jurusan, contoh: TKR, RPL, AKL.
   */
  @Column({ type: 'varchar', length: 150, nullable: true })
  jurusan: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rombel: string;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => Sekolah, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_sekolah' })
  sekolah: Sekolah;

  @ManyToOne(() => Jurusan, {
    createForeignKeyConstraints: false,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_jurusan' })
  jurusan_data: Jurusan;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
