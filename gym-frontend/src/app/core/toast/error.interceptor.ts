import { HttpInterceptorFn } from '@angular/common/http';
import { inject }            from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService }      from './toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError(err => {
      // Don't toast on 401 — authGuard handles that
      if (err.status !== 401) {
        toast.showMessage(err,'error');
      }
      return throwError(() => err);
    })
  );
};