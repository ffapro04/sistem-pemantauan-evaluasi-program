/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('t_assessment')
export class Assessment {
  @PrimaryGeneratedColumn()
  id_assessment: number;

  @Column({ nullable: true })
  id_ho: number;

  @Column({ nullable: true })
  nama: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  dibuat_oleh: number;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'boolean', default: true })
  aktif: boolean;

  @Column('int', { array: true, default: '{}' })
  target_sekolah_ids: number[];

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  paused_at: Date;

  @Column({ type: 'integer', default: 0 })
  total_paused_seconds: number;

  @Column({ nullable: true })
  tenggat: number;

  @Column({ default: 'non-akademik' })
  jenis: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pilar: string;
}
