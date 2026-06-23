/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Sekolah } from '../../sekolah/entities/sekolah.entity';

@Entity('m_jurusan')
@Unique(['id_sekolah', 'kode_jurusan'])
export class Jurusan {
  @PrimaryGeneratedColumn()
  id_jurusan: number;

  @Column()
  id_sekolah: number;

  @Column({ type: 'varchar', length: 150 })
  nama_jurusan: string;

  @Column({ type: 'varchar', length: 30 })
  kode_jurusan: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => Sekolah, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_sekolah' })
  sekolah: Sekolah;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
