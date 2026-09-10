import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiError, ErrorResponse } from '../api/models';
import { AuthService } from './auth.service';

/**
 * Normalises every failed HTTP call into an `ApiError { status, body }`
 * (§12). On a 401 whose message is the JWT entry-point's "Full
 * authentication is required…" (session expired / never logged in on a
 * protected route), clears the session and redirects to
 * `/login?reason=expired`. Any other 401 (business authorization, e.g.
 * "not the author") is left for the caller to display — it must not log
 * the user out.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      // status === 0 → network/CORS failure, no body at all.
      const body: ErrorResponse | null =
        error.error && typeof error.error === 'object' && 'message' in error.error
          ? (error.error as ErrorResponse)
          : null;

      const apiError: ApiError = { status: error.status, body };

      const isSessionExpired = apiError.status === 401 && !!body?.message?.includes('Full authentication');
      if (isSessionExpired) {
        auth.clear();
        router.navigate(['/login'], { queryParams: { reason: 'expired' } });
      }

      return throwError(() => apiError);
    })
  );
};
