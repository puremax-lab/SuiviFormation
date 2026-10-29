import { Routes } from '@angular/router';
import { adminGuard } from './core/role';

export const routes: Routes = [
  {
    path: '',
    title: 'Tableau de bord',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'sessions',
    title: 'Sessions',
    loadComponent: () => import('./pages/sessions/session-list').then((m) => m.SessionList),
  },
  {
    path: 'sessions/nouvelle',
    title: 'Nouvelle session',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/sessions/session-form').then((m) => m.SessionForm),
  },
  {
    path: 'sessions/:id',
    title: 'Session',
    loadComponent: () => import('./pages/sessions/session-detail').then((m) => m.SessionDetail),
  },
  {
    path: 'sessions/:id/modifier',
    title: 'Modifier la session',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/sessions/session-form').then((m) => m.SessionForm),
  },
  {
    path: 'stagiaires',
    title: 'Stagiaires',
    loadComponent: () => import('./pages/trainees/trainee-list').then((m) => m.TraineeList),
  },
  {
    path: 'stagiaires/nouveau',
    title: 'Nouveau stagiaire',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/trainees/trainee-form').then((m) => m.TraineeForm),
  },
  {
    path: 'stagiaires/:id/modifier',
    title: 'Modifier le stagiaire',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/trainees/trainee-form').then((m) => m.TraineeForm),
  },
  {
    path: 'presences',
    title: 'Présences',
    loadComponent: () => import('./pages/attendance/attendance').then((m) => m.Attendance),
  },
  {
    path: 'mentions-legales',
    title: 'Mentions légales',
    loadComponent: () => import('./pages/legal').then((m) => m.Legal),
  },
  {
    path: '**',
    title: 'Page introuvable',
    loadComponent: () => import('./pages/not-found').then((m) => m.NotFound),
  },
];
