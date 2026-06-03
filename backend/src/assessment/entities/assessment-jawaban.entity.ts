/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('assessment_jawaban')
export class AssessmentJawaban {
  @PrimaryGeneratedColumn()
  id_jawaban: number;

  @Column()
  id_pertanyaan: number;

  @Column({ nullable: true })
  id_user: number;

  @Column({ nullable: true })
  id_guru_assessment: number;

  @Column({ type: 'text', nullable: true })
  jawaban: string;

  @Column({ type: 'int', default: 0, nullable: true })
  skor: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_pengisi: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  nama_guru_snapshot: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
