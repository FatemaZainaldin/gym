import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, catchError, map } from 'rxjs';
import { User } from '@/app/projects/superadmin/users/users.model';
import { AuthService } from '@/app/projects/shared/auth/auth.service';
import { Tenant } from '@/app/projects/superadmin/clients/clients.model';

interface ApiResponse<T = void> {
  success: boolean;
  name: string;
  message: { en: string; ar: string };
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class TenantResolver implements Resolve<ApiResponse<Tenant | null>> {
    constructor(
        private authService: AuthService,
        private router: Router) { }

    resolve(route: ActivatedRouteSnapshot): Observable<ApiResponse<Tenant | null>> {
        // Support domain from route param, query param (?domain=ABC), or hostname subdomain

        const paramDomain = route.paramMap.get('domain') ?? route.queryParamMap.get('domain');

        // Safely read hostname only in browser (avoid ReferenceError during SSR)
        // Treat localhost and other local hosts as no domain provided.
        let hostDomain: string | null = null;
        try {
            const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname)
                ? window.location.hostname
                : null;
            if (hostname && !['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)) {
                hostDomain = hostname.split('.')[0];
            }
        } catch {
            hostDomain = null;
        }

        const domain = paramDomain ?? hostDomain ?? 'badan';

        return this.authService.loadTenant(domain).pipe(
            map((t) => t ?? null),
            catchError((err) => {
                this.router.navigate(['/error']);
                return EMPTY;
            }),
        );
    }
}
