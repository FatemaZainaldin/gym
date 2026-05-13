import { Route } from '@angular/router';
import { authGuard } from './domains/auth/auth.guard';

export const routes: Route[] = [
  // Website routes
  {
    path: 'home',
    loadChildren: () => import('./domains/website/routes'),
  },

  // Auth
  {
    path: 'auth',
    loadChildren: () => import('./domains/auth/routes'),
  },

  // Admin
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'admin',
  },
  {
    path: 'admin',
    // canActivate: [authGuard],
    loadChildren: () => import('./domains/admin/routes'),
  },

  // Coming soon
  {
    path: 'coming-soon',
    loadChildren: () => import('./domains/coming-soon/routes'),
  },
];
