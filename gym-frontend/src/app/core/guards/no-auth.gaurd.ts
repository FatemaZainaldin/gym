// src/app/core/auth/no-auth.guard.ts
// Redirects logged-in users away from /login
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../../core/services/auth.state';

export const noAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.isLoggedIn()) {
    const returnUrl = route.queryParams['returnUrl'];

    if (returnUrl) {
      router.navigateByUrl(returnUrl);
    } else {
      const link = authState?.user()?.modules?.flatMap(m => m.children ?? [])?.find(c => c.isDefault)?.link;

      if (link) {
        router.navigateByUrl(link);
      }
    }
    return false;
  }

  return true;
};