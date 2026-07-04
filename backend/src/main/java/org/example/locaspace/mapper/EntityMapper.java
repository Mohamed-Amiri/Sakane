package org.example.locaspace.mapper;

import org.example.locaspace.dto.avis.AvisResponse;
import org.example.locaspace.dto.lieu.LieuRequest;
import org.example.locaspace.dto.lieu.LieuResponse;
import org.example.locaspace.dto.reservation.ReservationResponse;
import org.example.locaspace.dto.user.UserResponse;
import org.example.locaspace.dto.user.UserSummaryResponse;
import org.example.locaspace.model.Avis;
import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.Reservation;
import org.example.locaspace.model.User;
import org.example.locaspace.model.enums.LieuType;
import org.example.locaspace.repository.AvisRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class EntityMapper {

    private static final Logger log = LoggerFactory.getLogger(EntityMapper.class);

    @Autowired
    private AvisRepository avisRepository;

    public UserSummaryResponse toUserSummaryResponse(User user) {
        if (user == null) {
            return null;
        }

        return new UserSummaryResponse(
            user.getId(),
            user.getNom(),
            user.getEmail(),
            user.getRole() != null ? user.getRole().name() : null
        );
    }

    public UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }

        Long totalReservations = user.getReservations() != null ? (long) user.getReservations().size() : 0L;
        Long totalReviews = user.getAvis() != null ? (long) user.getAvis().size() : 0L;

        Double averageRating = null;
        if (user.getAvis() != null && !user.getAvis().isEmpty()) {
            averageRating = user.getAvis().stream()
                .mapToInt(Avis::getNote)
                .average()
                .orElse(0.0);
        }

        return new UserResponse(
            user.getId(),
            user.getNom(),
            user.getEmail(),
            user.getRole() != null ? user.getRole().name() : null,
            null,
            totalReservations,
            totalReviews,
            averageRating
        );
    }

    public LieuResponse toLieuResponse(Lieu lieu) {
        if (lieu == null) {
            return null;
        }

        UserSummaryResponse owner = toUserSummaryResponse(lieu.getOwner());
        Double averageRating = avisRepository.findAverageNoteByLieu(lieu);
        Long reviewCount = avisRepository.countByLieu(lieu);

        return new LieuResponse(
            lieu.getId(),
            lieu.getTitre(),
            lieu.getDescription(),
            formatLieuType(lieu.getType()),
            lieu.getPrix(),
            lieu.getAdresse(),
            lieu.isValide(),
            lieu.getPhotos(),
            owner,
            averageRating,
            reviewCount,
            lieu.getMaxGuests(),
            lieu.getBedrooms(),
            lieu.getBathrooms(),
            lieu.getAmenities(),
            lieu.getCity(),
            lieu.getNeighborhood(),
            lieu.getActive(),
            lieu.getLatitude(),
            lieu.getLongitude(),
            lieu.getHouseRules(),
            lieu.getCheckInTime(),
            lieu.getCheckOutTime(),
            lieu.getMinimumNights()
        );
    }

    public Lieu toLieu(LieuRequest request, LieuType type) {
        if (request == null) {
            return null;
        }

        return Lieu.builder()
            .titre(request.getTitre())
            .description(request.getDescription())
            .type(type)
            .prix(request.getPrix())
            .adresse(request.getAdresse())
            .photos(request.getPhotos())
            .maxGuests(request.getMaxGuests())
            .bedrooms(request.getBedrooms())
            .bathrooms(request.getBathrooms())
            .amenities(request.getAmenities())
            .city(request.getCity())
            .neighborhood(request.getNeighborhood())
            .active(request.getActive())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .houseRules(request.getHouseRules())
            .checkInTime(request.getCheckInTime())
            .checkOutTime(request.getCheckOutTime())
            .minimumNights(request.getMinimumNights())
            .build();
    }

    public ReservationResponse toReservationResponse(Reservation reservation) {
        if (reservation == null) {
            return null;
        }

        try {
            UserSummaryResponse locataire = null;
            if (reservation.getLocataire() != null) {
                String fallbackName = "User " + reservation.getLocataire().getId();
                locataire = new UserSummaryResponse(
                    reservation.getLocataire().getId(),
                    safeString(reservation.getLocataire().getNom(), fallbackName),
                    safeString(reservation.getLocataire().getEmail(), ""),
                    reservation.getLocataire().getRole() != null ? reservation.getLocataire().getRole().name() : "LOCATAIRE"
                );
            }

            LieuResponse lieu = null;
            if (reservation.getLieu() != null) {
                String fallbackTitle = "Lieu " + reservation.getLieu().getId();
                lieu = new LieuResponse(
                    reservation.getLieu().getId(),
                    safeString(reservation.getLieu().getTitre(), fallbackTitle),
                    safeString(reservation.getLieu().getDescription(), ""),
                    formatLieuType(reservation.getLieu().getType()),
                    reservation.getLieu().getPrix(),
                    safeString(reservation.getLieu().getAdresse(), ""),
                    reservation.getLieu().isValide(),
                    safeList(reservation.getLieu().getPhotos()),
                    null,
                    null,
                    null,
                    reservation.getLieu().getMaxGuests(),
                    reservation.getLieu().getBedrooms(),
                    reservation.getLieu().getBathrooms(),
                    reservation.getLieu().getAmenities(),
                    reservation.getLieu().getCity(),
                    reservation.getLieu().getNeighborhood(),
                    reservation.getLieu().getActive(),
                    reservation.getLieu().getLatitude(),
                    reservation.getLieu().getLongitude(),
                    reservation.getLieu().getHouseRules(),
                    reservation.getLieu().getCheckInTime(),
                    reservation.getLieu().getCheckOutTime(),
                    reservation.getLieu().getMinimumNights()
                );
            }

            Long totalNights = null;
            Double totalPrice = reservation.getTotalPrice() != null ? reservation.getTotalPrice().doubleValue() : null;

            if (reservation.getDateDebut() != null && reservation.getDateFin() != null) {
                totalNights = ChronoUnit.DAYS.between(reservation.getDateDebut(), reservation.getDateFin());
                if (totalPrice == null && reservation.getLieu() != null && reservation.getLieu().getPrix() != null) {
                    totalPrice = reservation.getLieu().getPrix().doubleValue() * totalNights;
                }
            }

            return new ReservationResponse(
                reservation.getId(),
                reservation.getDateDebut(),
                reservation.getDateFin(),
                reservation.getStatut() != null ? reservation.getStatut().name() : null,
                locataire,
                lieu,
                totalNights,
                totalPrice,
                reservation.getGuests(),
                reservation.getGuestName(),
                reservation.getGuestEmail(),
                reservation.getGuestPhone(),
                reservation.getSpecialRequests(),
                reservation.getOwnerMessage(),
                reservation.getCancellationReason(),
                reservation.getCreatedAt(),
                reservation.getAcceptedAt(),
                reservation.getRejectedAt(),
                reservation.getCancelledAt()
            );
        } catch (Exception e) {
            log.error("Error mapping reservation to response", e);
            throw new RuntimeException("Failed to map reservation", e);
        }
    }

    public LieuResponse toLieuSummaryResponse(Lieu lieu) {
        if (lieu == null) {
            return null;
        }

        return new LieuResponse(
            lieu.getId(),
            lieu.getTitre(),
            lieu.getDescription(),
            formatLieuType(lieu.getType()),
            lieu.getPrix(),
            lieu.getAdresse(),
            lieu.isValide(),
            lieu.getPhotos(),
            null,
            null,
            null,
            lieu.getMaxGuests(),
            lieu.getBedrooms(),
            lieu.getBathrooms(),
            lieu.getAmenities(),
            lieu.getCity(),
            lieu.getNeighborhood(),
            lieu.getActive(),
            lieu.getLatitude(),
            lieu.getLongitude(),
            lieu.getHouseRules(),
            lieu.getCheckInTime(),
            lieu.getCheckOutTime(),
            lieu.getMinimumNights()
        );
    }

    public AvisResponse toAvisResponse(Avis avis) {
        if (avis == null) {
            return null;
        }

        return AvisResponse.builder()
            .id(avis.getId())
            .note(avis.getNote())
            .commentaire(avis.getCommentaire())
            .dateCreation(null)
            .auteurId(avis.getAuteur() != null ? avis.getAuteur().getId() : null)
            .auteurNom(avis.getAuteur() != null ? avis.getAuteur().getNom() : null)
            .lieuId(avis.getLieu() != null ? avis.getLieu().getId() : null)
            .lieuTitre(avis.getLieu() != null ? avis.getLieu().getTitre() : null)
            .build();
    }

    private String safeString(String value, String defaultValue) {
        return value != null ? value : defaultValue;
    }

    private List<String> safeList(List<String> value) {
        return value;
    }

    private String formatLieuType(LieuType type) {
        if (type == null) {
            return null;
        }

        switch (type) {
            case APPARTEMENT:
            case APARTMENT:
                return "Appartement";
            case MAISON:
                return "Maison";
            case VILLA:
                return "Villa";
            case STUDIO:
                return "Studio";
            case LOFT:
                return "Loft";
            case CHAMBRE:
                return "Chambre";
            case OFFICE:
                return "Bureau";
            case EVENT_SPACE:
                return "Salle_Evenement";
            default:
                return type.name();
        }
    }
}
