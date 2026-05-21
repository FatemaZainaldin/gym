import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { StorageService } from '@/app/domains/services/storage.service';
import { LocalStorage } from './local-storage';

export const provideLocalStorage = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    // Initialize the LocalStorage
    provideAppInitializer(() => {
      inject(LocalStorage);
      inject(StorageService)
    }),
  ]);
