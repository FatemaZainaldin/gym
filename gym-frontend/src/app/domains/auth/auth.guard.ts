import { inject } from '@angular/core';
import { CanActivateFn, Router,
         ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthState } from './auth.state';

export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authState = inject(AuthState);
  const router    = inject(Router);

  if (authState.isLoggedIn()) return true;

  // Not logged in → /login, but preserve the URL they were trying to reach
  return router.createUrlTree(['/auth/sign-in'], {
    queryParams: { returnUrl: state.url },
  });
};