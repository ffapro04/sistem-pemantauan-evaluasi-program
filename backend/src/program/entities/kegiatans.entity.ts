/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Fase } from './fase.entity';
import { Termin } from './termin.entity';
import { PersyaratanKegiatan } from './persyaratan-kegiatan.entity';

@Entity('t_kegiatans')
export class Kegiatans {
  @PrimaryGeneratedColumn()
  id_kegiatans: number;

  @Column()
  nama_kegiatans: string;

  @Column({ nullable: true })
  deskripsi: string;

  @Column()
  urutan: number;

  @Column()
  id_fase: number;

  @ManyToOne(() => Fase, (fase) => fase.kegiatans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_fase' })
  fase: Fase;

  @OneToMany(() => Termin, (termin) => termin.kegiatans)
  termin: Termin[];

  @OneToMany(() => PersyaratanKegiatan, (persyaratan) => persyaratan.kegiatan)
  persyaratan: PersyaratanKegiatan[];
}
