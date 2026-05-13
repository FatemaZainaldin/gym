import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthState } from './auth.state';

let isRefreshing   = false;
const refreshDone$ = new BehaviorSubject<boolean>(false);

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const state   = inject(AuthState);
  const authSvc = inject(AuthService);

  const token = state.token();
  const isAuthEndpoint = req.url.includes('/auth/login')
                      || req.url.includes('/auth/refresh')
                      || req.url.includes('/auth/register');

  // Proactive refresh: if token expires in < 60 seconds, refresh now
  const expiry = state.tokenExpiry();
  const nowPlusSixty = Math.floor(Date.now() / 1000) + 60;
  if (token && expiry && expiry < nowPlusSixty && !isAuthEndpoint && !isRefreshing) {
    isRefreshing = true;
    refreshDone$.next(false);
    return authSvc.refresh().pipe(
      switchMap(() => {
        isRefreshing = false;
        refreshDone$.next(true);
        return next(addToken(req, state.token()!));
      }),
      catchError(err => {
        isRefreshing = false;
        authSvc.logout();
        return throwError(() => err);
      })
    ) as any;
  }

  // If a refresh is in progress, queue this request until it's done
  if (isRefreshing) {
    return refreshDone$.pipe(
      filter(done => done),
      take(1),
      switchMap(() => next(addToken(req, state.token()!))),
    );
  }

  const authReq = token && !isAuthEndpoint ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthEndpoint && !isRefreshing) {
        authSvc.logout();
      }
      return throwError(() => err);
    }),
  );
};

function addToken(req: HttpRequest<unknown>, token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}