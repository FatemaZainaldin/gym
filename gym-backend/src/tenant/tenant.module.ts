import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantContextService } from './tenant.context';
import { TenantInterceptor } from './tenant.interceptor';

@Global()   // TenantContextService available everywhere without importing
@Module({
  imports:   [TypeOrmModule.forFeature([Tenant])],
  providers: [TenantContextService, TenantInterceptor],
  exports:   [TenantContextService, TenantInterceptor, TypeOrmModule],
})
export class TenantsModule {}