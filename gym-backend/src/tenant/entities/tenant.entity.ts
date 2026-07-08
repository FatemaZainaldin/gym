import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum TenantStatus {
  ACTIVE    = 'active',
  TRIAL     = 'trial',
  SUSPENDED = 'suspended',
  INACTIVE  = 'inactive',
  PENDING   = 'pending',
}

export enum SubscriptionPlan {
  FREE       = 'free',
  STARTER    = 'starter',
  PRO        = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('tenants')
export class Tenant extends BaseEntity {

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  subdomain: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  adminEmail?: string;

  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.TRIAL , enumName: 'tenant_status_enum',  })
  status: TenantStatus;

  @Column({ type: 'enum', enum: SubscriptionPlan, default: SubscriptionPlan.FREE, enumName: 'tenant_plan_enum',  })
  plan: SubscriptionPlan;

  @Column({ type: 'timestamptz', nullable: true })
  trialEndsAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  suspendedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  activatedAt?: Date;

  @Column({ type: 'text', nullable: true })
  internalNotes?: string;

  @Column({ type: 'jsonb', default: '{}' })
  featureFlags: Record<string, boolean>;

  
}