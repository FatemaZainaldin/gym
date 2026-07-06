// src/modules/users/entities/user.entity.ts
import { Entity, Column, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { TenantBaseEntity } from '../../tenant/entities/tenant-base.entity';
import { Role } from '../enums/role.enum';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  ON_LEAVE = 'on_leave'
}

@Entity('users')
export class User extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.MEMBER, enumName: 'user_role_enum' })
  role: Role;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE, enumName: 'user_status_enum' })
  status: UserStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'boolean', default: false })
  mustChangePassword: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  refreshTokenHash?: string;

  @Column({ type: 'varchar', nullable: true })
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