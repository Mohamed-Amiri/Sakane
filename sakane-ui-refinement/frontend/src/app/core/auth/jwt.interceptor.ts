import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/** Endpoints that never take a bearer token, even when a session exists. */
const PUBLIC_AUTH_PATHS = ['/api/auth/login', '/api/auth/register'];

/**
 * Attaches `Authorization: Bearer <accessToken>` to every /api/** request
 * except login/register. Never attaches to /uploads/** (§3/§9).
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.includes('/api/');
  const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => req.url.includes(path));

  if (!isApiRequest || isPublicAuthRequest) {
    return next(req);
  }

  const auth = inject(AuthService);
  const token = auth.currentToken();
  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
