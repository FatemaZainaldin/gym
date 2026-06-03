// src/app/core/auth/no-auth.guard.ts
// Redirects logged-in users away from /login
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../services/auth.state';

export const noAuthGuard: CanActivateFn = () => {
  const state = inject(AuthState);
  const router = inject(Router)

  if (state.isLoggedIn()) {
    const module = state?.user()?.modules?.find(module => module.isDefault);
    if (module?.link) {
      router.navigateByUrl(module.link)
    }
    return false;

  }
  return true;
};