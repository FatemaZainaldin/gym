import { Route } from '@angular/router';
import { authGuard } from './domains/auth/auth.guard';
import { noAuthGuard } from './domains/auth/no-auth.gaurd';
import { roleGuard } from './domains/auth/role.gaurd';
import { wildcardGuard } from './domains/auth/wild-card.gaurd';

export const routes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [wildcardGuard],
    loadChildren: () => import('./domains/auth/routes'),
  },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () => import('./domains/auth/routes'),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./features/admin/routes'),
  },
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
    loadChildren: () => import('./features/customer/routes'),
  },

  {
    path: 'trainer',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['trainer'] },
    loadChildren: () => import('./features/customer/routes'),
  },

  {
    path: '**',
    canActivate: [wildcardGuard],
    loadChildren: () => import('./domains/auth/routes'),
  },
];
