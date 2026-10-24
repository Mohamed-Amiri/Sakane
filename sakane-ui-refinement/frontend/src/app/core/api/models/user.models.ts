import { Role } from './auth.models';

/** GET /api/users/me (§7.5) */
export interface UserResponse {
  id: number;
  nom: string;
  email: string;
  role: Role;
  /** Always null — backend limitation (§13.9). Never show "member since". */
  createdAt: string | null;
  totalReservations: number;
  totalReviews: number;
  averageRating: number | null;
}

/** Embedded owner/tenant summary on LieuResponse / ReservationResponse (§7.5) */
export interface UserSummaryResponse {
  id: number;
  nom: string;
  email: string;
  role: Role;
}

/**
 * PUT /api/users/me request — the backend accepts a raw User entity (§13.15).
 * Only send the fields you intend to change: nom, email, and optionally password.
 */
export interface UpdateUserRequest {
  nom?: string;
  email?: string;
  password?: string;
}
