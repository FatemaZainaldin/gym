import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import {
  provideClientHydration,
  withIncrementalHydration,
} from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideIcons } from '@/app/core/icons/provider';
import { provideTheming } from '@/app/core/theming';
import { TranslocoHttpLoader } from '@/app/core/transloco/transloco-http-loader';
import { routes } from './app.routes';
import { jwtInterceptor } from './domains/auth/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        jwtInterceptor,
      ]),),
    provideClientHydration(withIncrementalHydration()),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),

    // Material
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },
    provideNativeDateAdapter(),

    // Core
    provideIcons(),
    provideTheming({
      scheme: 'light',
      primary: '#f97316',
      error: '#dc2626',
    }),
    // Third-party
    provideTransloco({
      config: {
        availableLangs: [
          {
            id: 'en',
            label: 'English',
          },
          {
            id: 'ar',
            label: 'Arabic',
          },
        ],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ],
};
