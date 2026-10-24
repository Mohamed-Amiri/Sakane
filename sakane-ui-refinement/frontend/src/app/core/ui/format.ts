/** Formatting helpers ported 1:1 from the prototype's UI.* formatters (js/ui.js). */

export function money(n: number | null | undefined): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function fmtDate(iso: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—';
  const date = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return date.toLocaleDateString('en-GB', opts ?? { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtRange(a: string | null | undefined, b: string | null | undefined): string {
  if (!a || !b) return '—';
  const sameYear = a.slice(0, 4) === b.slice(0, 4);
  return `${fmtDate(a, sameYear ? { day: 'numeric', month: 'short' } : undefined)} → ${fmtDate(b)}`;
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function initials(nom: string | null | undefined): string {
  return (nom || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function plural(n: number, one: string, many?: string): string {
  return `${n} ${n === 1 ? one : many ?? `${one}s`}`;
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Resolve a possibly-relative /uploads/... photo URL against the API base URL (§3 Photos). */
export function photoUrl(url: string | null | undefined, apiBaseUrl: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
