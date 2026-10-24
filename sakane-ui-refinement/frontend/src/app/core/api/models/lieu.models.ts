import { UserSummaryResponse } from './user.models';

/**
 * Type codes accepted by LieuRequest.type (§7.2). Case-insensitive on the
 * backend; aliases (house, room, apartment, chalet, bureau, event-space,
 * "event space") are also accepted but these are the canonical codes used
 * by this app's forms.
 */
export type LieuTypeCode =
  | 'appartement'
  | 'maison'
  | 'villa'
  | 'studio'
  | 'loft'
  | 'chambre'
  | 'chalet'
  | 'office'
  | 'event_space';

/** Create/update request body for a place (§7.2). */
export interface LieuRequest {
  titre: string;
  description: string;
  type: string;
  prix: number;
  adresse: string;
  photos?: string[];
  maxGuests?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  amenities?: string[];
  city?: string | null;
  neighborhood?: string | null;
  active?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  houseRules?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  minimumNights?: number | null;
}

/**
 * Place response (§7.2). `type` is a **display label** ("Villa", "Bureau",
 * "Salle_Evenement", …) — never send it back as a request `type`. Every
 * optional field can be null on seeded/older rows (§13.16) — null-guard all
 * of them in templates.
 */
export interface LieuResponse {
  id: number;
  titre: string;
  description: string;
  type: string;
  prix: number;
  adresse: string;
  valide: boolean;
  photos: string[];
  owner: UserSummaryResponse | null;
  averageRating: number | null;
  reviewCount: number | null;
  maxGuests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[];
  city: string | null;
  neighborhood: string | null;
  active: boolean | null;
  latitude: number | null;
  longitude: number | null;
  houseRules: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  minimumNights: number | null;
}
