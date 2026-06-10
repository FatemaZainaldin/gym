import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.gaurd';
import { roleGuard } from './core/guards/role.gaurd';
import { wildcardGuard } from './core/guards/wild-card.gaurd';

export const routes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [wildcardGuard],
    loadChildren: () => import('./features/auth/routes'),
  },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () => import('./features/auth/routes'),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./features/admin/admin.routes'),
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
    loadChildren: () => import('./features/auth/routes'),
  },
];
