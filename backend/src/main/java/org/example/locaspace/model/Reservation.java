package org.example.locaspace.model;

import jakarta.persistence.*;
import lombok.*;
import org.example.locaspace.model.enums.ReservationStatus;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "reservations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@SQLDelete(sql = "UPDATE reservations SET deleted = true WHERE id = ?")
@Where(clause = "deleted = false")
public class Reservation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateDebut;
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    private ReservationStatus statut;
    private Integer guests;
    private BigDecimal totalPrice;
    private String guestName;
    private String guestEmail;
    private String guestPhone;

    @Column(length = 1000)
    private String specialRequests;

    @Column(length = 1000)
    private String ownerMessage;

    @Column(length = 1000)
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime cancelledAt;

    @Builder.Default
    private boolean deleted = false;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User locataire;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lieu_id")
    private Lieu lieu;
}
