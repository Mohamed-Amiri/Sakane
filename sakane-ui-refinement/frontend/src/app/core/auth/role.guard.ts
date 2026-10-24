import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../api/models';
import { AuthService } from './auth.service';

/** Requires a valid session AND a specific frontendRole (LOCATAIRE / PROPRIETAIRE). */
export function roleGuard(role: Role): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login'], {
        queryParams: { redirect: state.url, reason: 'auth' }
      });
    }

    if (auth.role() !== role) {
      return router.createUrlTree([auth.homeFor(auth.role())]);
    }

    return true;
  };
}
