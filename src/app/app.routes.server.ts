import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },

  { path: 'vesti', renderMode: RenderMode.Prerender },
  { path: 'vesti/nova', renderMode: RenderMode.Prerender },
  { path: 'vesti/:id', renderMode: RenderMode.Server },
  { path: 'vesti/:id/uredi', renderMode: RenderMode.Server },

  { path: 'afere', renderMode: RenderMode.Prerender },
  { path: 'afere/nova', renderMode: RenderMode.Prerender },
  { path: 'afere/:id', renderMode: RenderMode.Server },
  { path: 'afere/:id/uredi', renderMode: RenderMode.Server },

  { path: 'akcije', renderMode: RenderMode.Prerender },
  { path: 'akcije/nova', renderMode: RenderMode.Prerender },
  { path: 'akcije/:id', renderMode: RenderMode.Server },
  { path: 'akcije/:id/uredi', renderMode: RenderMode.Server },

  { path: 'kalendar', renderMode: RenderMode.Prerender },
  { path: 'prijava-problema', renderMode: RenderMode.Prerender },
  { path: 'nalog', renderMode: RenderMode.Server },
  { path: 'prijava', renderMode: RenderMode.Prerender },

  { path: '**', renderMode: RenderMode.Server },
];
