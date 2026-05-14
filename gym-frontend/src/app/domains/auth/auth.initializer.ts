// src/app/core/auth/auth.initializer.ts
import { inject } from '@angular/core';
import { AuthState } from './auth.state';
import { AuthService } from './auth.service';
import { catchError, of, firstValueFrom } from 'rxjs';

export function authInitializer() {
  const state = inject(AuthState);
  const authSvc = inject(AuthService);

  return () => {
    if (!state.token()) return Promise.resolve();

    // Convert observable to Promise — fixes the task tracking error
    return firstValueFrom(
      authSvc.loadMe().pipe(
        catchError(() => {
          state.clear();
          return of(null);
        })
      )
    );
  };
}