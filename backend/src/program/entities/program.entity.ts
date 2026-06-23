/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Fase } from './fase.entity';
import { User } from 'src/users/user.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Sekolah } from 'src/sekolah/entities/sekolah.entity';


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

<<<<<<< HEAD
=======
  @ManyToOne(() => Sekolah)
  @JoinColumn({ name: 'id_sekolah' })
  sekolah : Sekolah;

>>>>>>> 55395b99654a0c44898aa60d46a595d174a20e95
  @Column('int', { name: 'id_vendor', array: true, nullable: true })
  id_vendor: number[];

  @ManyToOne(() => Vendor)
  vendor : Vendor;


  @Column({ nullable: true })
  id_pengawas: number;

  @ManyToOne(() => User) // Program punya banyak ke satu User (Pengawas)
  @JoinColumn({ name: 'id_pengawas' }) // Ini ngasih tau TypeORM kalau kolom kuncinya adalah id_pengawas
  pengawas: User;

  @Column({ type: 'float', nullable: true, default: 0 }) // Lebih fleksibel dibanding numeric(15,2)
  harga_vendor: number;
//   @Column({ type: 'numeric', precision: 20, scale: 2, nullable: true, default: 0 })
// harga_vendor: number;

  @Column()
  kategori: string;

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

  @Column('int', { array: true, nullable: true, default: () => "'{}'" })
  sekolah_ids: number[];

  @Column('int', { array: true, nullable: true, default: () => "'{}'" })
  ao_ids: number[];

  @Column('int', { array: true, nullable: true, default: () => "'{}'" })
  vendor_ids: number[];

  @OneToMany(() => Fase, (fase) => fase.program)
  fases: Fase[];
}