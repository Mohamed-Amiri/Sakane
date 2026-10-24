import { environment } from '../../../environments/environment';

/**
 * Resolve a photo URL for display. Absolute URLs (`http(s)://…`, `data:`)
 * pass through untouched; backend-relative paths (`/uploads/lieux/…`,
 * returned for uploaded photos) get the API origin prefixed — the frontend
 * dev server cannot serve them from its own origin.
 */
export function photoUrl(url: string): string {
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  if (url.startsWith('/')) return `${environment.apiBaseUrl}${url}`;
  if (url) return `${environment.apiBaseUrl}/${url}`;
  return url;
}
