/** GET /api/lieux/{id}/availability response (§7.6) — auth-only (§13.2). */
export interface AvailabilityResponse {
  lieuId: number;
  unavailableDates: string[];
  bookedRanges: BookedRange[];
}

export interface BookedRange {
  start: string;
  end: string;
  reason: 'booked' | 'blocked';
}

/** POST .../calendar/block request (§7.6). */
export interface CalendarBlockRequest {
  startDate: string;
  endDate: string;
  title?: string;
}

/**
 * Owner calendar event (§7.6). `id` is null for synthesized reservation
 * pseudo-events. `type` is "booked" (confirmed), "pending" (en attente) or
 * "blocked" (manual owner block). Reservation-derived events already use
 * `endDate = dateFin - 1 day` — do not adjust it again on the frontend.
 */
export interface CalendarEvent {
  id: number | null;
  type: 'booked' | 'pending' | 'blocked';
  title: string | null;
  startDate: string;
  endDate: string;
  /** Embedded place — present on the real backend response but unused by the UI. */
  lieu?: unknown;
}
