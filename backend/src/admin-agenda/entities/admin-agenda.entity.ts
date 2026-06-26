/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminAgendaParticipant } from './admin-agenda-participant.entity';

export enum AdminAgendaStatus {
  SCHEDULED = 'SCHEDULED',
  RESCHEDULED = 'RESCHEDULED',
  PENDING = 'PENDING',
  RESUMED = 'RESUMED',
  CANCELLED = 'CANCELLED',
  DONE = 'DONE',
}

export enum AdminAgendaVisibilityScope {
  TARGETED = 'TARGETED',
  INTERNAL = 'INTERNAL',
  ALL = 'ALL',
}

@Entity('admin_agenda')
export class AdminAgenda {
  @PrimaryGeneratedColumn()
  id_agenda: number;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date' })
  agenda_date: string;

  @Column({ type: 'time', nullable: true })
  start_time: string | null;

  @Column({ type: 'time', nullable: true })
  end_time: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  location: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  pilar: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  activity_type: string | null;

  @Column({ type: 'text', nullable: true })
  meeting_link: string | null;

  @Column({ type: 'jsonb', nullable: true })
  jenjang_targets: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  wilayah_targets: number[] | null;

  @Column({
    type: 'enum',
    enum: AdminAgendaStatus,
    enumName: 'admin_agenda_status_enum',
    default: AdminAgendaStatus.SCHEDULED,
  })
  status: AdminAgendaStatus;

  @Column({
    type: 'enum',
    enum: AdminAgendaVisibilityScope,
    enumName: 'admin_agenda_visibility_scope_enum',
    default: AdminAgendaVisibilityScope.TARGETED,
  })
  visibility_scope: AdminAgendaVisibilityScope;

  @Column({ type: 'text', nullable: true })
  status_note: string | null;

  @Column({ type: 'int', nullable: true })
  created_by: number | null;

  @OneToMany(
    () => AdminAgendaParticipant,
    (participant) => participant.agenda,
    { cascade: false },
  )
  participants: AdminAgendaParticipant[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
