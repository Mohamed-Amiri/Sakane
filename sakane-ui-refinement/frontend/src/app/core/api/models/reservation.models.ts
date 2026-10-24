import { LieuResponse } from './lieu.models';
import { UserSummaryResponse } from './user.models';

export type ReservationStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'REFUSEE' | 'ANNULEE' | 'TERMINEE';

/**
 * POST /api/reservations request (§7.3). Field names are English here —
 * contrast with ReservationResponse, which reads back French field names.
 */
export interface ReservationRequest {
  placeId: number;
  startDate: string;
  endDate: string;
  guests?: number;
  totalPrice?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
  ownerMessage?: string;
  cancellationReason?: string;
}

/** PUT /api/reservations/{id}/status request body. */
export interface ReservationStatusUpdate {
  status: ReservationStatus;
  message?: string;
}

/** Reservation response (§7.3) — note the French field names for core fields. */
export interface ReservationResponse {
  id: number;
  dateDebut: string;
  dateFin: string;
  statut: ReservationStatus;
  locataire: UserSummaryResponse;
  lieu: LieuResponse;
  totalNights: number;
  totalPrice: number | null;
  guests: number | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  specialRequests: string | null;
  ownerMessage: string | null;
  cancellationReason: string | null;
  createdAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
}
