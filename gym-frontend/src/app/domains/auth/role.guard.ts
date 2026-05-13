import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot,
         RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthState } from './auth.state';


export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
) => {
  const authState = inject(AuthState);
  const authSvc   = inject(AuthService);

  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  // No roles configured → any authenticated user passes
  if (!allowedRoles.length) return true;

  const userRole = authState.role();

  // ✅ Correct role — let them through
  if (userRole && allowedRoles.includes(userRole)) return true;

  // ❌ Wrong role — send to THEIR own portal, not to /login
  // (they are authenticated, just in the wrong section)
  // authSvc.redirectByRole();
  return false;
};