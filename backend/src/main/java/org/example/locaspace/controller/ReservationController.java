package org.example.locaspace.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.example.locaspace.dto.reservation.ReservationResponse;
import org.example.locaspace.dto.reservation.ReservationRequest;
import org.example.locaspace.exception.ResourceNotFoundException;
import org.example.locaspace.mapper.EntityMapper;
import org.example.locaspace.model.Reservation;
import org.example.locaspace.model.User;
import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.enums.ReservationStatus;
import org.example.locaspace.security.UserDetailsServiceImpl;
import org.example.locaspace.service.ReservationService;
import org.example.locaspace.service.LieuService;
import org.example.locaspace.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private static final Logger log = LoggerFactory.getLogger(ReservationController.class);

    private final ReservationService reservationService;
    private final UserService userService;
    private final LieuService lieuService;
    private final EntityMapper entityMapper;

    public ReservationController(ReservationService reservationService, 
                                 UserService userService, 
                                 LieuService lieuService, 
                                 EntityMapper entityMapper) {
        this.reservationService = reservationService;
        this.userService = userService;
        this.lieuService = lieuService;
        this.entityMapper = entityMapper;
    }

    // Owner: Get reservations for their spaces
    @GetMapping("/owner")
    @PreAuthorize("hasRole('PROPRIETAIRE')")
    public ResponseEntity<List<ReservationResponse>> getReservationsForOwner(Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal principal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User owner = userService.getUserById(principal.getId());
        List<Reservation> reservations = reservationService.getReservationsByOwner(owner);
        List<ReservationResponse> responses = reservations.stream().map(entityMapper::toReservationResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Tenant: Get own reservations
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal principal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User tenant = userService.getUserById(principal.getId());
        List<Reservation> reservations = reservationService.getReservationsByTenant(tenant);
        List<ReservationResponse> responses = reservations.stream().map(entityMapper::toReservationResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Tenant: Create reservation
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody ReservationRequest request,
                                                                 Authentication authentication) {
        User tenant = null;
        try {
            UserDetailsServiceImpl.UserPrincipal principal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
            tenant = userService.getUserById(principal.getId());
            
            log.debug("Creating reservation for user: {} ({})", tenant.getId(), tenant.getNom());
            log.debug("Request DTO: {}", request);

            Optional<Lieu> lieuOpt = lieuService.getLieuById(request.getPlaceId());
            if (lieuOpt.isEmpty()) {
                log.error("Lieu not found with ID: {}", request.getPlaceId());
                return ResponseEntity.notFound().build();
            }
            
            Lieu lieu = lieuOpt.get();
            log.debug("Found lieu: {}", lieu.getTitre());

            Reservation reservation = Reservation.builder()
                    .lieu(lieu)
                    .locataire(tenant)
                    .dateDebut(request.getStartDate())
                    .dateFin(request.getEndDate())
                    .guests(request.getGuests())
                    .totalPrice(request.getTotalPrice())
                    .guestName(request.getGuestName())
                    .guestEmail(request.getGuestEmail())
                    .guestPhone(request.getGuestPhone())
                    .specialRequests(request.getSpecialRequests())
                    .ownerMessage(request.getOwnerMessage())
                    .cancellationReason(request.getCancellationReason())
                    .createdAt(request.getCreatedAt())
                    .acceptedAt(request.getAcceptedAt())
                    .rejectedAt(request.getRejectedAt())
                    .cancelledAt(request.getCancelledAt())
                    .build();

            log.debug("Creating reservation...");
            Reservation saved = reservationService.createReservation(reservation);
            log.debug("Reservation created with ID: {}", saved.getId());
            
            ReservationResponse response = entityMapper.toReservationResponse(saved);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            log.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            log.error("Invalid argument: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            log.error("Illegal state: {}", e.getMessage());
            return ResponseEntity.status(409).build(); // Conflict
        } catch (Exception e) {
            log.error("Error creating reservation: {} - {}. User ID: {}", e.getClass().getSimpleName(), e.getMessage(), (tenant != null ? tenant.getId() : "null"), e);
            return ResponseEntity.status(500).build();
        }
    }

    // Tenant: Cancel reservation
    @DeleteMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id, Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal principal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User tenant = userService.getUserById(principal.getId());
        boolean ok = reservationService.cancelReservation(id, tenant);
        return ok ? ResponseEntity.noContent().build() : ResponseEntity.status(403).build();
    }

    // Owner: Accept/Reject reservation
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('PROPRIETAIRE')")
    public ResponseEntity<ReservationResponse> updateReservationStatus(@PathVariable Long id,
                                                                        @RequestBody java.util.Map<String, String> body) {
        String statusStr = body.get("status");
        String message = body.get("message");
        ReservationStatus status = ReservationStatus.valueOf(statusStr.toUpperCase());
        Reservation updated = reservationService.updateReservationStatus(id, status, message);
        return ResponseEntity.ok(entityMapper.toReservationResponse(updated));
    }
}
