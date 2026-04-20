package com.example.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeCalculationRequest {

    @NotNull(message = "Container ID is required")
    private Long containerId;

    @NotNull(message = "Storage end date is required")
    private LocalDate storageEndDate;

    // Optional: if container was delivered and not returned (detention)
    private LocalDate expectedReturnDate;
    private LocalDate actualReturnDate;
}