// src/documents/entities/document.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  document_code!: string;

  @Column({ type: 'varchar', length: 255 })
  document_title!: string;

  @Column({ type: 'varchar', length: 255, name: 'original_name' })
  originalName!: string;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType!: string;

  @Column({ type: 'integer' })
  size!: number;

  @Column({ type: 'boolean', default: false, name: 'is_sensitive' })
  isSensitive!: boolean;

  @Column({ type: 'text', name: 'file_path' })
  filePath!: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId!: string;

  @ManyToOne(() => User, (user) => user.user_documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  document_owner!: User;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
