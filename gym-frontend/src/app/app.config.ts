import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideIcons } from '@/app/core/icons/provider';
import { provideTheming } from '@/app/core/theming';
import { TranslocoHttpLoader } from '@/app/core/transloco/transloco-http-loader';
import { routes } from './app.routes';
import { loadingInterceptor } from './core/loader/loading.interceptor';
import { provideLocalStorage } from './core/local-storage';
import { AuthState } from './core/services/auth.state';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/toast/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideLocalStorage(),
    provideAppInitializer(async () => {
      const authState = inject(AuthState);
      await authState.init();
    }),
    // ── HTTP — must be first ──────────────────────────────────────────────
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor, loadingInterceptor, errorInterceptor]),
    ),

    // ── Router ───────────────────────────────────────────────────────────
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),

    // ── Remove provideClientHydration entirely ───────────────────────────
    // provideClientHydration(withIncrementalHydration()),
    // This caused the task tracking error + breaks sessionStorage

    // ── Remove APP_INITIALIZER ───────────────────────────────────────────
    // authInitializer is handled inside authGuard now (see below)

    // ── Material ─────────────────────────────────────────────────────────
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
    provideNativeDateAdapter(),

    // ── Core ─────────────────────────────────────────────────────────────
    provideIcons(),
    provideTheming({
      scheme: 'light',
      primary: '#10B981',
      error: '#dc2626',
    }),
    // #7DAA8A — primary buttons, active state, key actions
    // #5C8A6B — hover, sidebar active, borders
    // #E8F4EE — badge backgrounds, card surfaces
    // #3A6B4A — text on light green surfaces

    // ── Transloco ────────────────────────────────────────────────────────
    provideTransloco({
      config: {
        availableLangs: [
          { id: 'en', label: 'English' },
          { id: 'ar', label: 'Arabic' },
        ],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ],
};