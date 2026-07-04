package org.example.locaspace.service;


import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.User;
import org.example.locaspace.model.enums.LieuType;
import org.example.locaspace.repository.LieuRepository;
import org.example.locaspace.repository.AvisRepository;
import org.example.locaspace.repository.LieuSpecifications;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import org.example.locaspace.dto.lieu.AvailabilityResponse;
import org.example.locaspace.dto.lieu.BookedRange;
import org.example.locaspace.repository.ReservationRepository;
import org.example.locaspace.repository.CalendarEventRepository;
import org.example.locaspace.model.Reservation;
import org.example.locaspace.model.CalendarEvent;
import org.example.locaspace.model.enums.ReservationStatus;

@Service
@Transactional
public class LieuService {
    
    private final LieuRepository lieuRepository;
    private final AvisRepository avisRepository;
    private final ReservationRepository reservationRepository;
    private final CalendarEventRepository calendarEventRepository;
    
    @Autowired
    public LieuService(LieuRepository lieuRepository, AvisRepository avisRepository,
                       ReservationRepository reservationRepository, CalendarEventRepository calendarEventRepository) {
        this.lieuRepository = lieuRepository;
        this.avisRepository = avisRepository;
        this.reservationRepository = reservationRepository;
        this.calendarEventRepository = calendarEventRepository;
    }
    
    // Create new lieu
    public Lieu createLieu(Lieu lieu) {
        lieu.setValide(true); 
        return lieuRepository.save(lieu);
    }
    
    // Get all validated lieux (public)
    public Page<Lieu> getAllValidatedLieux(Pageable pageable) {
        return lieuRepository.findByValideTrue(pageable);
    }
    
    // Get lieu by ID
    public Optional<Lieu> getLieuById(Long id) {
        return lieuRepository.findById(id);
    }

    public AvailabilityResponse getAvailability(Long lieuId, LocalDate startDate, LocalDate endDate) {
        Lieu lieu = lieuRepository.findById(lieuId).orElseThrow();
        
        List<Reservation> reservations = reservationRepository.findByLieu(lieu).stream()
                .filter(r -> (r.getStatut() == ReservationStatus.CONFIRMEE || r.getStatut() == ReservationStatus.EN_ATTENTE) 
                        && (r.getDateDebut().isBefore(endDate) && r.getDateFin().isAfter(startDate)))
                .toList();

        List<CalendarEvent> blockedEvents = calendarEventRepository.findInRange(lieu, startDate, endDate);

        List<String> unavailableDates = new ArrayList<>();
        List<BookedRange> bookedRanges = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;

        for (Reservation r : reservations) {
            bookedRanges.add(new BookedRange(r.getDateDebut().format(formatter), r.getDateFin().format(formatter), "booked"));
            LocalDate current = r.getDateDebut();
            while (current.isBefore(r.getDateFin())) {
                unavailableDates.add(current.format(formatter));
                current = current.plusDays(1);
            }
        }

        for (CalendarEvent e : blockedEvents) {
            bookedRanges.add(new BookedRange(e.getStartDate().format(formatter), e.getEndDate().format(formatter), "blocked"));
            LocalDate current = e.getStartDate();
            while (!current.isAfter(e.getEndDate())) {
                unavailableDates.add(current.format(formatter));
                current = current.plusDays(1);
            }
        }

        return AvailabilityResponse.builder()
                .lieuId(lieuId)
                .unavailableDates(unavailableDates)
                .bookedRanges(bookedRanges)
                .build();
    }
    
    // Get lieux by owner
    public List<Lieu> getLieuxByOwner(User owner) {
        return lieuRepository.findByOwner(owner);
    }
    
    // Update lieu (only owner can update)
    public Lieu updateLieu(Long id, Lieu updatedLieu, User currentUser) {
        return lieuRepository.findById(id)
            .filter(lieu -> lieu.getOwner().getId().equals(currentUser.getId()))
            .map(lieu -> {
                lieu.setTitre(updatedLieu.getTitre());
                lieu.setDescription(updatedLieu.getDescription());
                lieu.setType(updatedLieu.getType());
                lieu.setPrix(updatedLieu.getPrix());
                lieu.setAdresse(updatedLieu.getAdresse());
                lieu.setPhotos(updatedLieu.getPhotos());
                lieu.setValide(true); // Always validated now
                return lieuRepository.save(lieu);
            })
            .orElse(null);
    }
    
    // Delete lieu (owner or admin)
    public boolean deleteLieu(Long id, User currentUser) {
        return lieuRepository.findById(id)
            .map(lieu -> {
                // Check if user is owner
                if (lieu.getOwner().getId().equals(currentUser.getId())) {
                    lieuRepository.delete(lieu);
                    return true;
                }
                return false;
            })
            .orElse(false);
    }
    

    
    // Search functionality
    public Page<Lieu> searchLieux(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllValidatedLieux(pageable);
        }
        return lieuRepository.searchByKeyword(keyword.trim(), pageable);
    }
    
    // Filter by type
    public Page<Lieu> getLieuxByType(LieuType type, Pageable pageable) {
        return lieuRepository.findByType(type, pageable);
    }
    
    // Filter by price range
    public Page<Lieu> getLieuxByPriceRange(BigDecimal minPrix, BigDecimal maxPrix, Pageable pageable) {
        return lieuRepository.findByPrixBetween(minPrix, maxPrix, pageable);
    }
    
    // Filter by city
    public Page<Lieu> getLieuxByCity(String ville, Pageable pageable) {
        return lieuRepository.findByAdresseContainingIgnoreCase(ville, pageable);
    }
    
    // Advanced search with multiple filters
    public Page<Lieu> searchLieuxWithFilters(LieuType type, BigDecimal minPrix, BigDecimal maxPrix, String ville, Pageable pageable) {
        return lieuRepository.findAll(
            LieuSpecifications.withFilters(type, minPrix, maxPrix, ville), 
            pageable
        );
    }
    
    // Get lieu statistics
    public LieuStats getLieuStats(Long lieuId) {
        return lieuRepository.findById(lieuId)
            .map(lieu -> {
                Double averageRating = avisRepository.findAverageNoteByLieu(lieu);
                Long reviewCount = avisRepository.countByLieu(lieu);
                
                return new LieuStats(
                    lieu.getId(),
                    averageRating != null ? averageRating : 0.0,
                    reviewCount
                );
            })
            .orElse(null);
    }
    
    // Get owner statistics
    public OwnerStats getOwnerStats(User owner) {
        Long lieuCount = lieuRepository.countByOwner(owner);
        List<Lieu> ownerLieux = lieuRepository.findByOwner(owner);
        
        double totalRating = 0.0;
        long totalReviews = 0;
        
        for (Lieu lieu : ownerLieux) {
            Double avgRating = avisRepository.findAverageNoteByLieu(lieu);
            Long reviewCount = avisRepository.countByLieu(lieu);
            
            if (avgRating != null) {
                totalRating += avgRating * reviewCount;
                totalReviews += reviewCount;
            }
        }
        
        double overallRating = totalReviews > 0 ? totalRating / totalReviews : 0.0;
        
        return new OwnerStats(
            owner.getId(),
            lieuCount,
            overallRating,
            totalReviews
        );
    }
    
    // Inner classes for statistics
    public static class LieuStats {
        private Long lieuId;
        private Double averageRating;
        private Long reviewCount;
        
        public LieuStats(Long lieuId, Double averageRating, Long reviewCount) {
            this.lieuId = lieuId;
            this.averageRating = averageRating;
            this.reviewCount = reviewCount;
        }
        
        // Getters
        public Long getLieuId() { return lieuId; }
        public Double getAverageRating() { return averageRating; }
        public Long getReviewCount() { return reviewCount; }
    }
    
    public static class OwnerStats {
        private Long ownerId;
        private Long lieuCount;
        private Double overallRating;
        private Long totalReviews;
        
        public OwnerStats(Long ownerId, Long lieuCount, Double overallRating, Long totalReviews) {
            this.ownerId = ownerId;
            this.lieuCount = lieuCount;
            this.overallRating = overallRating;
            this.totalReviews = totalReviews;
        }
        
        // Getters
        public Long getOwnerId() { return ownerId; }
        public Long getLieuCount() { return lieuCount; }
        public Double getOverallRating() { return overallRating; }
        public Long getTotalReviews() { return totalReviews; }
    }
}
