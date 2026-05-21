import { HttpInterceptorFn }  from '@angular/common/http';
import { inject, untracked } from '@angular/core';
import { finalize }           from 'rxjs/operators';
import { LoadingService }     from './loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  if (req.headers.has('X-Silent')) {
    return next(req.clone({ headers: req.headers.delete('X-Silent') }));
  }

  untracked(() => loading.start());

  return next(req).pipe(
    finalize(() => untracked(() => loading.stop()))
  );
};