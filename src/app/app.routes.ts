import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then(m => m.Home) },

  // Вести (news)
  { path: 'vesti', loadComponent: () => import('./news/news').then(m => m.News) },
  { path: 'vesti/nova', canActivate: [adminGuard], loadComponent: () => import('./news-form/news-form').then(m => m.NewsForm) },
  { path: 'vesti/:id', loadComponent: () => import('./news-detail/news-detail').then(m => m.NewsDetail) },
  { path: 'vesti/:id/uredi', canActivate: [adminGuard], loadComponent: () => import('./news-form/news-form').then(m => m.NewsForm) },

  // Афере (affairs)
  { path: 'afere', loadComponent: () => import('./affairs/affairs').then(m => m.Affairs) },
  { path: 'afere/nova', canActivate: [adminGuard], loadComponent: () => import('./affairs-form/affairs-form').then(m => m.AffairsForm) },
  { path: 'afere/:id', loadComponent: () => import('./affairs-detail/affairs-detail').then(m => m.AffairsDetail) },
  { path: 'afere/:id/uredi', canActivate: [adminGuard], loadComponent: () => import('./affairs-form/affairs-form').then(m => m.AffairsForm) },

  // Акције (actions)
  { path: 'akcije', loadComponent: () => import('./actions/actions').then(m => m.Actions) },
  { path: 'akcije/nova', canActivate: [adminGuard], loadComponent: () => import('./actions-form/actions-form').then(m => m.ActionsForm) },
  { path: 'akcije/:id', loadComponent: () => import('./actions-detail/actions-detail').then(m => m.ActionsDetail) },
  { path: 'akcije/:id/uredi', canActivate: [adminGuard], loadComponent: () => import('./actions-form/actions-form').then(m => m.ActionsForm) },

  // Календар
  { path: 'kalendar', loadComponent: () => import('./calendar/calendar').then(m => m.Calendar) },

  // Пријава проблема
  { path: 'prijava-problema', loadComponent: () => import('./report/report').then(m => m.Report) },
  { path: 'prijavljeni-problemi', loadComponent: () => import('./reports-list/reports-list').then(m => m.ReportsList) },
  { path: 'obavestenja', loadComponent: () => import('./notifications/notifications').then(m => m.Notifications) },

  // Auth
  { path: 'prijava', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'zaboravljena-lozinka', loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPassword) },
  { path: 'nalog', canActivate: [authGuard], loadComponent: () => import('./account/account').then(m => m.Account) },
];
