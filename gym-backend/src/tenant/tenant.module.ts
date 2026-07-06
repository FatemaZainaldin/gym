import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantContextService } from './tenant.context';
import { TenantInterceptor } from './tenant.interceptor';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { MailModule } from 'src/mail/mail.module';
import { UsersModule } from 'src/users/users.module';

@Global()   // TenantContextService available everywhere without importing
@Module({
  imports: [TypeOrmModule.forFeature([Tenant]), MailModule,  UsersModule],
  providers: [TenantContextService, TenantInterceptor,TenantService ],
  controllers: [TenantController],
  exports: [TenantContextService, TenantInterceptor, TypeOrmModule, TenantService],
})
export class TenantsModule { }