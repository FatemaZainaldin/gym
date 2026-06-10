import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';

export interface TenantContext {
  tenantId: string | null;   // null = SuperAdmin (no tenant scope)
  isSuperAdmin: boolean;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  run<T>(context: TenantContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }

  getContext(): TenantContext | undefined {
    return this.storage.getStore();
  }

  getTenantId(): string | null {
    return this.storage.getStore()?.tenantId ?? null;
  }

  isSuperAdmin(): boolean {
    return this.storage.getStore()?.isSuperAdmin ?? false;
  }
}