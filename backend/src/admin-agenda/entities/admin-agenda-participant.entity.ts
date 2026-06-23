/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AdminAgenda } from './admin-agenda.entity';

export enum AdminAgendaParticipantType {
  // Nilai lama tetap dipertahankan untuk kompatibilitas database.
  USER = 'USER',
  ROLE = 'ROLE',
  SEKOLAH = 'SEKOLAH',
  VENDOR = 'VENDOR',
  GURU_ASSESSMENT = 'GURU_ASSESSMENT',
}

@Entity('admin_agenda_participant')
@Unique('UQ_admin_agenda_participant_target', [
  'id_agenda',
  'participant_type',
  'participant_id',
])
export class AdminAgendaParticipant {
  @PrimaryGeneratedColumn()
  id_participant: number;

  @Column({ type: 'int' })
  id_agenda: number;

  @Column({
    type: 'enum',
    enum: AdminAgendaParticipantType,
    enumName: 'admin_agenda_participant_type_enum',
  })
  participant_type: AdminAgendaParticipantType;

  @Column({ type: 'int' })
  participant_id: number;

  @Column({ type: 'varchar', length: 180, nullable: true })
  participant_name_snapshot: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  participant_email_snapshot: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  role_name_snapshot: string | null;

  @ManyToOne(() => AdminAgenda, (agenda) => agenda.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_agenda' })
  agenda: AdminAgenda;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
