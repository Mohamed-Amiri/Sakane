package org.example.locaspace.dto.lieu;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookedRange {
    private String start;
    private String end;
    private String reason;
}
