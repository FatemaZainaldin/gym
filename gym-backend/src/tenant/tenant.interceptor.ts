import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant.context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // set by JwtAuthGuard

    // Public routes (no JWT) — skip
    if (!user) return next.handle();

    const isSuperAdmin = user.role === 'super_admin';
    const tenantId = user.tenantId ?? null;

    // Gym users MUST have a tenantId in their JWT
    if (!isSuperAdmin && !tenantId) {
      throw new UnauthorizedException('Missing tenant context');
    }

    return new Observable(observer => {
      this.tenantContext.run({ tenantId, isSuperAdmin }, () => {
        next.handle().subscribe({
          next: v => observer.next(v),
          error: e => observer.error(e),
          complete: () => observer.complete(),
        });
      });
    });
  }
}