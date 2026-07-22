import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.authReady;

  if (!auth.isLoggedIn()) return router.createUrlTree(['/prijava']);
  if (!auth.isAdmin()) return router.createUrlTree(['/']);
  return true;
};
