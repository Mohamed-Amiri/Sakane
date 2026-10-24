/** POST/PUT avis request (§7.4). */
export interface AvisRequest {
  note: number;
  commentaire: string;
}

/** Avis (review) response (§7.4). `dateCreation` is always null — §13.8. */
export interface AvisResponse {
  id: number;
  note: number;
  commentaire: string;
  dateCreation: string | null;
  auteurId: number;
  auteurNom: string;
  lieuId: number;
  lieuTitre: string;
}

/** GET /api/lieux/{lieuId}/stats (§7.4) — auth-only (§13.2). */
export interface PlaceStatsResponse {
  lieuId: number;
  averageRating: number;
  reviewCount: number;
}
