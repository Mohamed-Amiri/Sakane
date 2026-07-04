package org.example.locaspace.dto.reservation;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.locaspace.validation.ValidDateRange;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ValidDateRange
public class ReservationRequest {

    @NotNull(message = "Lieu ID is required")
    private Long placeId;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be in the present or future")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDate endDate;

    private Integer guests;

    private java.math.BigDecimal totalPrice;

    @Size(max = 100)
    private String guestName;

    @Email(message = "Guest email must be valid")
    private String guestEmail;

    private String guestPhone;

    @Size(max = 1000)
    private String specialRequests;

    private String ownerMessage;

    private String cancellationReason;

    private LocalDateTime createdAt;

    private LocalDateTime acceptedAt;

    private LocalDateTime rejectedAt;

    private LocalDateTime cancelledAt;
}
