/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Program } from './program.entity';
import { Kegiatans } from './kegiatans.entity';
import { Termin } from './termin.entity';

@Entity('t_fase')
export class Fase {
  @PrimaryGeneratedColumn()
  id_fase: number;

  @Column()
  nama_fase: string;

  @Column({ nullable: true })
  deskripsi: string;

  @Column()
  urutan: number;

  @Column()
  id_program: number;

  @ManyToOne(() => Program, (program) => program.fases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_program' })
  program: Program;

  @OneToMany(() => Kegiatans, (kegiatans) => kegiatans.fase)
  kegiatans: Kegiatans[];

  @OneToMany(() => Termin, (termin) => termin.fase)
  termin: Termin[];
}
