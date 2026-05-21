// src/app/core/loading/loading.service.ts
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _count  = signal(0);
  readonly show   = computed(() => this._count() > 0);

  start(): void { this._count.update(n => n + 1); }
  stop():  void { this._count.update(n => Math.max(0, n - 1)); }
  reset(): void { this._count.set(0); }
}