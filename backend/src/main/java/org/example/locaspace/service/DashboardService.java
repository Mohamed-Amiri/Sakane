package org.example.locaspace.service;

import org.example.locaspace.dto.dashboard.OwnerDashboardStats;
import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.Reservation;
import org.example.locaspace.model.User;
import org.example.locaspace.model.enums.ReservationStatus;
import org.example.locaspace.repository.LieuRepository;
import org.example.locaspace.repository.ReservationRepository;
import org.example.locaspace.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    @Autowired
    private LieuRepository lieuRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public OwnerDashboardStats getOwnerDashboardStats(User owner) {
        List<Lieu> ownerLieux = lieuRepository.findByOwner(owner);
        long totalProperties = ownerLieux.size();
        // active is a Boolean field on Lieu
        long activeProperties = ownerLieux.stream()
                .filter(l -> Boolean.TRUE.equals(l.getActive()))
                .count();

        List<Reservation> ownerReservations = reservationRepository.findByLieuOwner(owner);

        long pendingRequests = ownerReservations.stream()
                .filter(r -> r.getStatut() == ReservationStatus.EN_ATTENTE)
                .count();

        long approvedBookings = ownerReservations.stream()
                .filter(r -> r.getStatut() == ReservationStatus.CONFIRMEE)
                .count();

        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());

        BigDecimal monthlyRevenue = ownerReservations.stream()
                .filter(r -> r.getStatut() == ReservationStatus.CONFIRMEE)
                .filter(r -> r.getDateDebut() != null
                        && !r.getDateDebut().isBefore(startOfMonth)
                        && !r.getDateDebut().isAfter(endOfMonth))
                .map(r -> r.getTotalPrice() != null ? r.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double averageRating = ownerLieux.stream()
                .filter(l -> l.getAvis() != null)
                .flatMap(l -> l.getAvis().stream())
                .mapToInt(a -> a.getNote())
                .average()
                .orElse(0.0);

        long unreadNotifications = notificationRepository.countByRecipientAndLuFalse(owner);

        return OwnerDashboardStats.builder()
                .totalProperties(totalProperties)
                .activeProperties(activeProperties)
                .pendingRequests(pendingRequests)
                .approvedBookings(approvedBookings)
                .monthlyRevenue(monthlyRevenue)
                .occupancyRate(0.0)
                .averageRating(averageRating)
                .unreadNotifications(unreadNotifications)
                .build();
    }
}
