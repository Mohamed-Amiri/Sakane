/** GET /api/owner/dashboard (§7.8). `occupancyRate` is always 0 — §13.7, never display it as real. */
export interface OwnerDashboardStats {
  totalProperties: number;
  activeProperties: number;
  pendingRequests: number;
  approvedBookings: number;
  monthlyRevenue: number;
  occupancyRate: number;
  averageRating: number;
  unreadNotifications: number;
}
