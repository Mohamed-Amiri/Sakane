import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { LieuService } from '../../../core/api/lieu.service';

/**
 * `/owner/calendar` has no place id of its own — mirrors the prototype's
 * owner-calendar page, which defaults to the owner's first place when no
 * `?id=` is given. Redirects to `/owner/places/:id/calendar` for the first
 * owned place, or to `/owner/places` (with its own "create a place first"
 * empty state) when the owner has none.
 */
export const calendarRedirectGuard: CanActivateFn = () => {
  const lieuService = inject(LieuService);
  const router = inject(Router);

  return lieuService.getMy().pipe(
    map((places) =>
      places.length
        ? router.createUrlTree(['/owner/places', places[0].id, 'calendar'])
        : router.createUrlTree(['/owner/places'])
    ),
    catchError(() => of(router.createUrlTree(['/owner/places'])))
  );
};
