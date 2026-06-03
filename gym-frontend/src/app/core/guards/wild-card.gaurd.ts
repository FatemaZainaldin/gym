// src/app/domains/auth/wildcard.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../services/auth.state';

export const wildcardGuard: CanActivateFn = () => {
  const state = inject(AuthState);
  const router = inject(Router);

  if (state.isLoggedIn()) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  return router.createUrlTree(['/auth/sign-in']);
};