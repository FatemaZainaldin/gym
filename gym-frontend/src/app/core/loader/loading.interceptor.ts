// src/app/core/loading/loading.interceptor.ts
import { inject }            from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize }          from 'rxjs/operators';
import { LoadingService }    from './loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  // Skip if request has X-Silent header
  if (req.headers.has('X-Silent')) {
    return next(req.clone({
      headers: req.headers.delete('X-Silent')
    }));
  }

  loading.start();
  return next(req).pipe(
    finalize(() => loading.stop())
  );
};