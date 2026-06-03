import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'vesti', pathMatch: 'full' },

  // Вести (news)
  { path: 'vesti', loadComponent: () => import('./news/news').then(m => m.News) },
  { path: 'vesti/nova', canActivate: [authGuard], loadComponent: () => import('./news-form/news-form').then(m => m.NewsForm) },
  { path: 'vesti/:id', loadComponent: () => import('./news-detail/news-detail').then(m => m.NewsDetail) },
  { path: 'vesti/:id/uredi', canActivate: [authGuard], loadComponent: () => import('./news-form/news-form').then(m => m.NewsForm) },

  // Афере (affairs)
  { path: 'afere', loadComponent: () => import('./affairs/affairs').then(m => m.Affairs) },
  { path: 'afere/nova', canActivate: [authGuard], loadComponent: () => import('./affairs-form/affairs-form').then(m => m.AffairsForm) },
  { path: 'afere/:id', loadComponent: () => import('./affairs-detail/affairs-detail').then(m => m.AffairsDetail) },
  { path: 'afere/:id/uredi', canActivate: [authGuard], loadComponent: () => import('./affairs-form/affairs-form').then(m => m.AffairsForm) },

  // Акције (actions)
  { path: 'akcije', canActivate: [authGuard], loadComponent: () => import('./actions/actions').then(m => m.Actions) },
  { path: 'akcije/nova', canActivate: [authGuard], loadComponent: () => import('./actions-form/actions-form').then(m => m.ActionsForm) },
  { path: 'akcije/:id', canActivate: [authGuard], loadComponent: () => import('./actions-detail/actions-detail').then(m => m.ActionsDetail) },
  { path: 'akcije/:id/uredi', canActivate: [authGuard], loadComponent: () => import('./actions-form/actions-form').then(m => m.ActionsForm) },

  // Календар
  { path: 'kalendar', canActivate: [authGuard], loadComponent: () => import('./calendar/calendar').then(m => m.Calendar) },

  // Auth
  { path: 'prijava', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'nalog', canActivate: [authGuard], loadComponent: () => import('./account/account').then(m => m.Account) },
];
