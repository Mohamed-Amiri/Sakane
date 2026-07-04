package org.example.locaspace.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerDashboardStats {
    private long totalProperties;
    private long activeProperties;
    private long pendingRequests;
    private long approvedBookings;
    private BigDecimal monthlyRevenue;
    private double occupancyRate;
    private double averageRating;
    private long unreadNotifications;
}
