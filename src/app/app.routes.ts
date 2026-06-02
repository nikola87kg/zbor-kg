import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'vesti', pathMatch: 'full' },
  { path: 'vesti', loadComponent: () => import('./news/news').then(m => m.News) },
  // 'nova' mora biti pre ':id' da bi se literal matchovao pre parametra
  { path: 'vesti/nova', canActivate: [authGuard], loadComponent: () => import('./news-form/news-form').then(m => m.NewsForm) },
  { path: 'vesti/:id', loadComponent: () => import('./news-detail/news-detail').then(m => m.NewsDetail) },
  { path: 'vesti/:id/uredi', canActivate: [authGuard], loadComponent: () => import('./news-form/news-form').then(m => m.NewsForm) },
  { path: 'kalendar', canActivate: [authGuard], loadComponent: () => import('./calendar/calendar').then(m => m.Calendar) },
  { path: 'akcije', canActivate: [authGuard], loadComponent: () => import('./actions/actions').then(m => m.Actions) },
  { path: 'afere', loadComponent: () => import('./affairs/affairs').then(m => m.Affairs) },
  { path: 'prijava', loadComponent: () => import('./login/login').then(m => m.Login) },
];
