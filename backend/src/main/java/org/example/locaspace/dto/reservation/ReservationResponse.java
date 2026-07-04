package org.example.locaspace.dto.reservation;

import org.example.locaspace.dto.lieu.LieuResponse;
import org.example.locaspace.dto.user.UserSummaryResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservationResponse {
    private Long id;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String statut;
    private UserSummaryResponse locataire;
    private LieuResponse lieu;
    private Long totalNights;
    private Double totalPrice;
    private Integer guests;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String specialRequests;
    private String ownerMessage;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime cancelledAt;
    
    // Constructors
    public ReservationResponse() {}
    
    public ReservationResponse(Long id, LocalDate dateDebut, LocalDate dateFin, String statut,
                             UserSummaryResponse locataire, LieuResponse lieu, Long totalNights, Double totalPrice) {
        this.id = id;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.statut = statut;
        this.locataire = locataire;
        this.lieu = lieu;
        this.totalNights = totalNights;
        this.totalPrice = totalPrice;
    }

    public ReservationResponse(Long id, LocalDate dateDebut, LocalDate dateFin, String statut,
                             UserSummaryResponse locataire, LieuResponse lieu, Long totalNights, Double totalPrice,
                             Integer guests, String guestName, String guestEmail, String guestPhone,
                             String specialRequests, String ownerMessage, String cancellationReason,
                             LocalDateTime createdAt, LocalDateTime acceptedAt, LocalDateTime rejectedAt,
                             LocalDateTime cancelledAt) {
        this(id, dateDebut, dateFin, statut, locataire, lieu, totalNights, totalPrice);
        this.guests = guests;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.guestPhone = guestPhone;
        this.specialRequests = specialRequests;
        this.ownerMessage = ownerMessage;
        this.cancellationReason = cancellationReason;
        this.createdAt = createdAt;
        this.acceptedAt = acceptedAt;
        this.rejectedAt = rejectedAt;
        this.cancelledAt = cancelledAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDate getDateDebut() {
        return dateDebut;
    }
    
    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }
    
    public LocalDate getDateFin() {
        return dateFin;
    }
    
    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }
    
    public String getStatut() {
        return statut;
    }
    
    public void setStatut(String statut) {
        this.statut = statut;
    }
    
    public UserSummaryResponse getLocataire() {
        return locataire;
    }
    
    public void setLocataire(UserSummaryResponse locataire) {
        this.locataire = locataire;
    }
    
    public LieuResponse getLieu() {
        return lieu;
    }
    
    public void setLieu(LieuResponse lieu) {
        this.lieu = lieu;
    }
    
    public Long getTotalNights() {
        return totalNights;
    }
    
    public void setTotalNights(Long totalNights) {
        this.totalNights = totalNights;
    }
    
    public Double getTotalPrice() {
        return totalPrice;
    }
    
    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Integer getGuests() { return guests; }
    public void setGuests(Integer guests) { this.guests = guests; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }
    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }
    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }
    public String getOwnerMessage() { return ownerMessage; }
    public void setOwnerMessage(String ownerMessage) { this.ownerMessage = ownerMessage; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }
    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}
