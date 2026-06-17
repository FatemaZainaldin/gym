import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { AuthService } from "../../projects/shared/auth/auth.service";
import { AuthState } from "../services/auth.state";

export const roleGuard: CanActivateFn = (route) => {
  const authState = inject(AuthState);
  const authSvc = inject(AuthService);

  // 1. What roles does this route allow?
  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  // 2. No roles defined → any logged-in user can access
  if (!allowedRoles.length) return true;

  // 3. Get the current user's role
  const userRole = authState.role();

  // 4. Role is in the allowed list → let through
  if (userRole && allowedRoles.includes(userRole)) return true;

  // 5. Wrong role → send to THEIR portal (not /login)
  authSvc.redirectByRole();
  return false;
};