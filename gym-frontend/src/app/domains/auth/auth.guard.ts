// src/app/core/auth/no-auth.guard.ts
// Redirects logged-in users away from /login
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthState } from './auth.state';

export const authGuard:CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
)  => {
  const authState = inject(AuthState);
  const router = inject(Router)

  if (authState.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/auth/sign-in'], {
    // queryParams: { returnUrl: state.url },
  });
};