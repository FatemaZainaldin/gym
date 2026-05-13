// src/modules/users/entities/user.entity.ts
import { Entity, Column, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../common/entities/base.entity';

export enum UserRole {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  @Exclude()            // never serialised to JSON response
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;


  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true, length: 500 })
  avatar?: string;

  @Column({ nullable: true, length: 20 })
  phone?: string;

  // The refresh token hash stored server-side for rotation verification
  @Column({ nullable: true })
  @Exclude()
  refreshTokenHash?: string;

  // For forgot-password flow
  @Column({ nullable: true })
  @Exclude()
  resetToken?: string;

  @Column({ type: 'timestamptz', nullable: true })
  @Exclude()
  resetTokenExpiry?: Date;

  // Computed helper — not stored
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Only hash if password was actually changed (not already a hash)
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }
}