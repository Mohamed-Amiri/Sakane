import { Injectable } from '@angular/core';
import { ApiError, isValidationError } from './models';

export interface ApiErrorMessageOptions {
  /** Message for a 409 (e.g. reservation date overlap). */
  conflict?: string;
  /** Message for a 500. */
  serverError?: string;
  /** Message for any other status with no usable body message. */
  generic?: string;
}

/**
 * Central API-error → UX message mapping (§12, ported from js/ui.js
 * `handleApiError`). Session-expiry (401 "Full authentication…") is
 * already handled by `errorInterceptor`, which clears the session and
 * redirects before this ever runs — components only need this for the
 * *displayable* message.
 */
export function apiErrorMessage(e: ApiError, opts: ApiErrorMessageOptions = {}): string {
  if (e.status === 403) {
    return "You don't have permission to do that.";
  }
  if (e.body?.message) {
    return e.body.message;
  }
  if (e.status === 409) {
    return opts.conflict ?? 'Those dates are no longer available.';
  }
  if (e.status === 500) {
    return opts.serverError ?? 'Something went wrong on the server. Please try again.';
  }
  if (e.status) {
    return opts.generic ?? 'The request could not be completed.';
  }
  return 'Cannot reach the server. Check your connection and try again.';
}

/** Maps a ValidationErrorResponse.validationErrors map to Angular form control errors. */
export function validationErrorsFrom(e: ApiError): Record<string, string> | null {
  return isValidationError(e.body) ? e.body.validationErrors : null;
}

/**
 * Injectable wrapper around the standalone apiErrorMessage/validationErrorsFrom
 * functions — components that prefer DI can inject this instead of importing
 * the functions directly.
 */
@Injectable({ providedIn: 'root' })
export class ApiErrorPresenter {
  apiErrorMessage(e: ApiError, opts?: ApiErrorMessageOptions): string {
    return apiErrorMessage(e, opts);
  }

  validationErrorsFrom(e: ApiError): Record<string, string> | null {
    return validationErrorsFrom(e);
  }
}
