import { LieuTypeCode } from '../api/models';

/** [code, English label] — used to populate <select> options (js/ui.js TYPES). */
export const TYPES: [LieuTypeCode, string][] = [
  ['appartement', 'Apartment'],
  ['maison', 'House'],
  ['villa', 'Villa'],
  ['studio', 'Studio'],
  ['loft', 'Loft'],
  ['chambre', 'Room'],
  ['chalet', 'Chalet'],
  ['office', 'Office'],
  ['event_space', 'Event space']
];

/**
 * LieuResponse.type is a display label ("Villa", "Bureau", "Salle_Evenement", …)
 * — never send it back as a request `type`. Use this to populate edit forms.
 */
export const LABEL_TO_CODE: Record<string, LieuTypeCode> = {
  Appartement: 'appartement',
  Maison: 'maison',
  Villa: 'villa',
  Studio: 'studio',
  Loft: 'loft',
  Chambre: 'chambre',
  Chalet: 'chalet',
  Bureau: 'office',
  Salle_Evenement: 'event_space'
};

export const CODE_TO_LABEL: Record<string, string> = Object.fromEntries(TYPES);

/** English label for a display-label `type` returned by the backend. */
export function prettyType(label: string | null | undefined): string {
  if (!label) return '—';
  const code = LABEL_TO_CODE[label];
  if (code) return CODE_TO_LABEL[code];
  return String(label).replace(/_/g, ' ');
}

export const RESERVATION_STATUS_META: Record<string, { label: string; cls: string }> = {
  EN_ATTENTE: { label: 'Pending', cls: 'badge--pending' },
  CONFIRMEE: { label: 'Confirmed', cls: 'badge--confirmed' },
  TERMINEE: { label: 'Completed', cls: 'badge--done' },
  REFUSEE: { label: 'Refused', cls: 'badge--refused' },
  ANNULEE: { label: 'Cancelled', cls: 'badge--cancelled' }
};
