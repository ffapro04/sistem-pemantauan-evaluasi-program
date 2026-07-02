/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('google_drive_files')
export class GoogleDriveFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_user', type: 'int' })
  id_user: number;

  @Column({ name: 'id_role', type: 'int', nullable: true })
  id_role: number | null;

  @Column({ name: 'module_type', type: 'varchar', length: 100 })
  module_type: string;

  @Column({ name: 'provider', type: 'varchar', length: 30, default: 'GOOGLE' })
  provider: string;

  @Column({
    name: 'related_table',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  related_table: string | null;

  @Column({ name: 'related_id', type: 'int', nullable: true })
  related_id: number | null;

  @Column({ name: 'drive_file_id', type: 'varchar', length: 255 })
  drive_file_id: string;

  @Column({
    name: 'drive_folder_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  drive_folder_id: string | null;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  original_name: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 255, nullable: true })
  mime_type: string | null;

  @Column({ name: 'size_bytes', type: 'bigint', nullable: true })
  size_bytes: number | null;

  @Column({ name: 'web_view_link', type: 'text', nullable: true })
  web_view_link: string | null;

  @Column({ name: 'web_content_link', type: 'text', nullable: true })
  web_content_link: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;
}
