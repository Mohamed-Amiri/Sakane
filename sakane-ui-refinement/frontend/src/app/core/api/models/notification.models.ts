/**
 * Only these four types actually occur (§13.10) — AVIS_NEW is never emitted
 * by the backend even though the enum name exists.
 */
export type NotificationType =
  | 'RESERVATION_NEW'
  | 'RESERVATION_CONFIRMED'
  | 'RESERVATION_CANCELLED'
  | 'SYSTEM';

/** GET /api/notifications item (§7.7). `lu` = "read". */
export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  lu: boolean;
  createdAt: string;
}
