// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';
import { Document } from '../../document/entities/document.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_code!: string;

  @Column({ type: 'varchar', length: 255 })
  user_name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  user_email!: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  user_password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  user_role!: UserRole;

  @OneToMany(() => Document, (document) => document.owner)
  user_documents!: Document[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
