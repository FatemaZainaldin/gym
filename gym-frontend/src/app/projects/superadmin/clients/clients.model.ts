

export interface Tenant {
    name: string;
    subdomain: string;
    country?: string;
    timezone: string;
    logoUrl: string;
    phone: string;
    adminEmail: string;
    status?: TenantStatus;
    plan?: SubscriptionPlan;
    trialEndsAt?: Date | string;
    suspendedAt: Date | string;
    internalNotes?: string;
    featureFlags?: Record<string, boolean>;
    id?:string;
}

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
