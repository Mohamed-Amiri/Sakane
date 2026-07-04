package org.example.locaspace.service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.Reservation;
import org.example.locaspace.model.User;
import org.example.locaspace.model.enums.ReservationStatus;
import org.example.locaspace.model.enums.Role;
import org.example.locaspace.repository.ReservationRepository;
import org.example.locaspace.repository.LieuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ReservationService {
    
    private final ReservationRepository reservationRepository;
    private final LieuRepository lieuRepository;
    private final NotificationService notificationService;
    
    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);

    @Autowired
    public ReservationService(ReservationRepository reservationRepository, 
                              LieuRepository lieuRepository,
                              NotificationService notificationService) {
        this.reservationRepository = reservationRepository;
        this.lieuRepository = lieuRepository;
        this.notificationService = notificationService;
    }
    
    // Create new reservation
    public Reservation createReservation(Reservation reservation) {
        try {
            log.debug("ReservationService: Creating reservation for lieu ID: {}", reservation.getLieu().getId());
            
            // Check if lieu exists and load it properly
            Optional<Lieu> lieuOpt = lieuRepository.findById(reservation.getLieu().getId());
            if (lieuOpt.isEmpty()) {
                throw new IllegalArgumentException("Lieu not found");
            }
            Lieu lieu = lieuOpt.get();
            reservation.setLieu(lieu);
            
            log.debug("ReservationService: Checking for conflicts...");
            // Check for date conflicts
            List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                lieu,
                reservation.getDateDebut(),
                reservation.getDateFin()
            );
            
            if (!conflicts.isEmpty()) {
                throw new IllegalStateException("Ces dates ne sont plus disponibles");
            }
            
            // Validate dates
            if (reservation.getDateDebut().isAfter(reservation.getDateFin()) ||
                reservation.getDateDebut().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Invalid reservation dates");
            }
            
            reservation.setStatut(ReservationStatus.EN_ATTENTE); // Default status
            log.debug("ReservationService: Saving reservation...");
            Reservation saved = reservationRepository.save(reservation);
            log.debug("ReservationService: Reservation saved with ID: {}", saved.getId());
            
            // Notify Owner
            notificationService.createNotification(
                lieu.getOwner(),
                "Nouvelle demande de réservation",
                "Vous avez reçu une nouvelle demande pour " + lieu.getTitre(),
                org.example.locaspace.model.Notification.NotificationType.RESERVATION_NEW
            );
            
            // Force refresh to load all relationships
            reservationRepository.flush();
            return reservationRepository.findByIdWithDetails(saved.getId()).orElse(saved);
        } catch (Exception e) {
            log.error("ReservationService: Error creating reservation: {}", e.getMessage());
            throw e;
        }
    }
    
    // Get reservation by ID
    public Optional<Reservation> getReservationById(Long id) {
        return reservationRepository.findById(id);
    }
    
    // Get reservations by tenant
    public List<Reservation> getReservationsByTenant(User locataire) {
        return reservationRepository.findByLocataire(locataire);
    }
    
    // Get reservations by owner (all reservations for owner's properties)
    public List<Reservation> getReservationsByOwner(User owner) {
        return reservationRepository.findByLieuOwner(owner);
    }
    
    // Get reservations by lieu
    public List<Reservation> getReservationsByLieu(Lieu lieu) {
        return reservationRepository.findByLieu(lieu);
    }
    
    // Get reservations by status
    public List<Reservation> getReservationsByStatus(ReservationStatus statut) {
        return reservationRepository.findByStatut(statut);
    }
    
    // Update reservation status (owner or admin)
    public Reservation updateReservationStatus(Long id, ReservationStatus newStatus, String messageOpt) {
        return reservationRepository.findById(id)
            .map(reservation -> {
                // Simplified server-side status update; validation can be expanded
                ReservationStatus oldStatus = reservation.getStatut();
                if (isValidStatusTransition(oldStatus, newStatus, true, false)) {
                    reservation.setStatut(newStatus);
                    Reservation saved = reservationRepository.save(reservation);
                    
                    // Notify Tenant
                    String title = "Mise à jour de votre réservation";
                    String message = "Votre réservation pour " + reservation.getLieu().getTitre() + " est maintenant : " + newStatus;
                    org.example.locaspace.model.Notification.NotificationType type = org.example.locaspace.model.Notification.NotificationType.SYSTEM;
                    
                    if (newStatus == ReservationStatus.CONFIRMEE) {
                        type = org.example.locaspace.model.Notification.NotificationType.RESERVATION_CONFIRMED;
                        message = "Bonne nouvelle ! Votre réservation pour " + reservation.getLieu().getTitre() + " a été confirmée.";
                    } else if (newStatus == ReservationStatus.REFUSEE) {
                        message = "Malheureusement, votre demande pour " + reservation.getLieu().getTitre() + " a été refusée.";
                    }
                    
                    notificationService.createNotification(reservation.getLocataire(), title, message, type);
                    
                    return saved;
                } else {
                    throw new IllegalArgumentException("Invalid status transition");
                }
            })
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
    }
    
    // Cancel reservation (tenant only, within cancellation period)
    public boolean cancelReservation(Long id, User tenant) {
        return reservationRepository.findById(id)
            .map(reservation -> {
                // Check if user is the tenant
                if (!reservation.getLocataire().getId().equals(tenant.getId())) {
                    return false;
                }
                
                // Check if cancellation is allowed (e.g., at least 24 hours before start date)
                if (reservation.getDateDebut().minusDays(1).isBefore(LocalDate.now())) {
                    throw new IllegalStateException("Cannot cancel reservation less than 24 hours before start date");
                }
                
                reservation.setStatut(ReservationStatus.ANNULEE);
                reservationRepository.save(reservation);
                
                // Notify Owner
                notificationService.createNotification(
                    reservation.getLieu().getOwner(),
                    "Réservation annulée",
                    "Le locataire a annulé sa réservation pour " + reservation.getLieu().getTitre(),
                    org.example.locaspace.model.Notification.NotificationType.RESERVATION_CANCELLED
                );
                
                return true;
            })
            .orElse(false);
    }
    
    // Delete reservation (Owner only)
    public boolean deleteReservation(Long id, User user) {
        return reservationRepository.findById(id)
            .map(reservation -> {
                // Only owner of the place can delete a reservation record
                if (!reservation.getLieu().getOwner().getId().equals(user.getId())) {
                    return false;
                }
                reservationRepository.delete(reservation);
                return true;
            })
            .orElse(false);
    }
    
    // Check availability for a lieu and date range
    public boolean isAvailable(Long lieuId, LocalDate dateDebut, LocalDate dateFin) {
        Optional<Lieu> lieuOpt = lieuRepository.findById(lieuId);
        if (lieuOpt.isEmpty()) {
            return false;
        }
        
        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
            lieuOpt.get(), dateDebut, dateFin
        );
        
        return conflicts.isEmpty();
    }
    
    // Get available dates for a lieu (next 90 days)
    public List<LocalDate> getAvailableDates(Long lieuId) {
        Optional<Lieu> lieuOpt = lieuRepository.findById(lieuId);
        if (lieuOpt.isEmpty()) {
            return List.of();
        }
        
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(90);
        
        List<Reservation> reservations = reservationRepository.findByLieu(lieuOpt.get());
        
        List<LocalDate> availableDates = new java.util.ArrayList<>();
        LocalDate current = today;
        
        while (!current.isAfter(endDate)) {
            final LocalDate checkDate = current;
            boolean isAvailable = reservations.stream()
                .filter(r -> ReservationStatus.CONFIRMEE.equals(r.getStatut()) || ReservationStatus.EN_ATTENTE.equals(r.getStatut()))
                .noneMatch(r -> !checkDate.isBefore(r.getDateDebut()) && !checkDate.isAfter(r.getDateFin()));
            
            if (isAvailable) {
                availableDates.add(current);
            }
            current = current.plusDays(1);
        }
        
        return availableDates;
    }
    
    // Get reservation statistics
    public ReservationStats getReservationStats(User user) {
        if (Role.PROPRIETAIRE.equals(user.getRole())) {
            // Owner stats
            Long totalReservations = reservationRepository.countByLieuOwner(user);
            List<Reservation> ownerReservations = reservationRepository.findByLieuOwner(user);
            
            long confirmedCount = ownerReservations.stream()
                .filter(r -> ReservationStatus.CONFIRMEE.equals(r.getStatut()))
                .count();
            
            long pendingCount = ownerReservations.stream()
                .filter(r -> ReservationStatus.EN_ATTENTE.equals(r.getStatut()))
                .count();
            
            return new ReservationStats(totalReservations, confirmedCount, pendingCount);
        } else {
            // Tenant stats
            Long totalReservations = reservationRepository.countByLocataire(user);
            List<Reservation> tenantReservations = reservationRepository.findByLocataire(user);
            
            long confirmedCount = tenantReservations.stream()
                .filter(r -> ReservationStatus.CONFIRMEE.equals(r.getStatut()))
                .count();
            
            long pendingCount = tenantReservations.stream()
                .filter(r -> ReservationStatus.EN_ATTENTE.equals(r.getStatut()))
                .count();
            
            return new ReservationStats(totalReservations, confirmedCount, pendingCount);
        }
    }
    
    // Validate status transitions
    private boolean isValidStatusTransition(ReservationStatus currentStatus, ReservationStatus newStatus, boolean isOwner, boolean isTenant) {
        switch (currentStatus) {
            case EN_ATTENTE:
                if (isOwner) {
                    return ReservationStatus.CONFIRMEE.equals(newStatus) || ReservationStatus.REFUSEE.equals(newStatus);
                }
                if (isTenant) {
                    return ReservationStatus.ANNULEE.equals(newStatus);
                }
                break;
            case CONFIRMEE:
                if (isOwner) {
                    return ReservationStatus.TERMINEE.equals(newStatus) || ReservationStatus.ANNULEE.equals(newStatus);
                }
                if (isTenant) {
                    return ReservationStatus.ANNULEE.equals(newStatus);
                }
                break;
            case REFUSEE:
            case ANNULEE:
            case TERMINEE:
                return false; 
        }
        return false;
    }
    
    // Get past reservations for reviews
    public List<Reservation> getPastReservationsForReview(User tenant) {
        return reservationRepository.findByLocataireAndStatut(tenant, ReservationStatus.TERMINEE);
    }
    
    // Statistics class
    public static class ReservationStats {
        private Long totalReservations;
        private Long confirmedReservations;
        private Long pendingReservations;
        
        public ReservationStats(Long totalReservations, Long confirmedReservations, Long pendingReservations) {
            this.totalReservations = totalReservations;
            this.confirmedReservations = confirmedReservations;
            this.pendingReservations = pendingReservations;
        }
        
        // Getters
        public Long getTotalReservations() { return totalReservations; }
        public Long getConfirmedReservations() { return confirmedReservations; }
        public Long getPendingReservations() { return pendingReservations; }
    }
}
