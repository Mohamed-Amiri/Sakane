/** Mirrors backend ErrorResponse (§7.9). */
export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

/** Mirrors backend ValidationErrorResponse (§7.9) — 400 on @Valid body failures. */
export interface ValidationErrorResponse extends ErrorResponse {
  validationErrors: Record<string, string>;
}

/**
 * Normalised shape produced by errorInterceptor for every failed HTTP call.
 * `body` is null when the backend returned an empty body (§13.6) or the
 * request never reached the server (status 0, network/CORS failure).
 */
export interface ApiError {
  status: number;
  body: ErrorResponse | ValidationErrorResponse | null;
}

export function isValidationError(body: ApiError['body']): body is ValidationErrorResponse {
  return !!body && 'validationErrors' in body && !!(body as ValidationErrorResponse).validationErrors;
}
