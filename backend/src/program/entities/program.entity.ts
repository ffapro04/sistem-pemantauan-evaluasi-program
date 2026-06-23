/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Fase } from './fase.entity';

@Entity('t_program')
export class Program {
  @PrimaryGeneratedColumn()
  id_program: number;

  @Column({ unique: true, nullable: true })
  kode_program: string;

  @Column()
  nama_program: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column()
  id_sekolah: number;

  @Column('int', { name: 'id_vendor', array: true, nullable: true })
  id_vendor: number[];

  @Column({ nullable: true })
  id_pengawas: number;

  /**
   * Kategori utama program:
   * - AKADEMIK
   * - NON_AKADEMIK
   */
  @Column()
  kategori: string;

  /**
   * Penanda 4 Pilar YPA-MDR:
   * - AKADEMIK
   * - KARAKTER
   * - SENI_BUDAYA
   * - KECAKAPAN_HIDUP
   *
   * Dibuat nullable agar data program lama tidak error.
   */
  @Column({ nullable: true })
  pilar_program: string;

  /**
   * Jenis pelaksanaan program:
   * - PROJECT
   * - REGULER
   */
  @Column({ default: 'PROJECT' })
  jenis_program: string;

  @Column({ nullable: true })
  tahun: number;

  @Column({ type: 'date', nullable: true })
  tanggal_mulai: Date;

  @Column({ type: 'date', nullable: true })
  tanggal_selesai: Date;

  @Column()
  status_program: string;

  @Column()
  dibuat_oleh: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ name: 'file_mou', nullable: true })
  file_mou: string;

  @Column({ nullable: true })
  nomor_mou: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  harga_vendor: number;

  @Column({ nullable: true })
  kpi_nama: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  kpi_target: number;

  @Column({ nullable: true })
  kpi_satuan: string;

  @Column('int', {
    array: true,
    nullable: true,
    default: () => "'{}'",
  })
  sekolah_ids: number[];

  @Column('int', {
    array: true,
    nullable: true,
    default: () => "'{}'",
  })
  ao_ids: number[];

  @Column('int', {
    array: true,
    nullable: true,
    default: () => "'{}'",
  })
  vendor_ids: number[];

  @OneToMany(() => Fase, (fase) => fase.program)
  fases: Fase[];
}
