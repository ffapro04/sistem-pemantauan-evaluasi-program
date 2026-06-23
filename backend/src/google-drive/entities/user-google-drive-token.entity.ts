/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_google_drive_tokens')
export class UserGoogleDriveToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_user', type: 'int' })
  id_user: number;

  @Column({ name: 'id_role', type: 'int', nullable: true })
  id_role: number | null;

  @Column({ name: 'owner_type', type: 'varchar', length: 50, default: 'USER' })
  owner_type: string;

  @Column({
    name: 'google_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  google_email: string | null;

  @Column({ name: 'google_name', type: 'varchar', length: 255, nullable: true })
  google_name: string | null;

  @Column({ name: 'access_token', type: 'text', nullable: true })
  access_token: string | null;

  @Column({ name: 'refresh_token', type: 'text' })
  refresh_token: string;

  @Column({ name: 'expiry_date', type: 'bigint', nullable: true })
  expiry_date: number | null;

  @Column({ name: 'scope', type: 'text', nullable: true })
  scope: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}
