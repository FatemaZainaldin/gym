// src/app/core/auth/no-auth.guard.ts
// Redirects logged-in users away from /login
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthState } from './auth.state';

export const noAuthGuard: CanActivateFn = () => {
  const state   = inject(AuthState);
  const authSvc = inject(AuthService);

  if (state.isLoggedIn()) {
    // authSvc.redirectByRole();
    return false;
  }
  return true;
};