import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Vet-Link - Inicio de Sesión',
    loadComponent: () => import('./features/login/login').then(m => m.Login)
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout').then(m => m.Layout),
    children: [
      {
        path: 'patients',
        title: 'Vet-Link - Gestión de Pacientes',
        loadComponent: () => import('./features/patients/patients').then(m => m.Patients)
      },
      {
        path: 'settings',
        title: 'Vet-Link - Configuración',
        loadComponent: () => import('./features/settings/settings').then(m => m.Settings)
      },
      { path: '', redirectTo: 'patients', pathMatch: 'full' }
    ]
  }
];
