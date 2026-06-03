// session-storage.ts
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getItem(key: string): string | null {
    return this.isBrowser ? sessionStorage.getItem(key) : null;
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser) sessionStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (this.isBrowser) sessionStorage.removeItem(key);
  }

  clear(): void {
    if (this.isBrowser) sessionStorage.clear();
  }
}