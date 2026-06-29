import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum TenantStatus {
  ACTIVE    = 'active',
  TRIAL     = 'trial',
  SUSPENDED = 'suspended',
  INACTIVE  = 'inactive',
}

export enum SubscriptionPlan {
  FREE       = 'free',
  STARTER    = 'starter',
  PRO        = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('tenants')
export class Tenant extends BaseEntity {

  @Column({ length: 150 })
  name: string;                        

  @Index({ unique: true })
  @Column({ length: 100 })
  subdomain: string;                    // "fitzone" → fitzone.badan.app

  @Column({ length: 100, nullable: true })
  country?: string;

  @Column({ length: 100, nullable: true })
  timezone?: string;                    

  @Column({  nullable: true })
  logoUrl?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255, nullable: true })
  adminEmail?: string;                  

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.TRIAL,
  })
  status: TenantStatus;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  plan: SubscriptionPlan;

  @Column({ type: 'timestamptz', nullable: true })
  trialEndsAt?: Date;                   // null = not on trial

  @Column({ type: 'timestamptz', nullable: true })
  suspendedAt?: Date;

  @Column({ type: 'text', nullable: true })
  internalNotes?: string;              // SA-only notes about this gym

  // Feature flags — driven by plan, overridable per tenant
  @Column({ type: 'jsonb', default: '{}' })
  featureFlags: Record<string, boolean>; // { ai_insights: true, qr_checkin: false }
}