import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'pageTitle.login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./shared/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: 'patients',
        title: 'pageTitle.patients',
        loadComponent: () => import('./features/patients/patients').then((m) => m.Patients),
      },
      {
        path: 'patients/:id',
        title: 'pageTitle.patients',
        loadComponent: () =>
          import('./features/patients/patient-detail/patient-detail').then(
            (m) => m.PatientDetailComponent
          ),
      },
      {
        path: 'settings',
        title: 'pageTitle.settings',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
      {
        path: 'settings/account',
        title: 'pageTitle.account',
        loadComponent: () => import('./features/settings/account/account').then((m) => m.Account),
      },
      { path: '', redirectTo: 'patients', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
