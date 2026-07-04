package org.example.locaspace.dto.lieu;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityResponse {
    private Long lieuId;
    private List<String> unavailableDates;
    private List<BookedRange> bookedRanges;
}
