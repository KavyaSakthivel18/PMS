package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GateOutMovementRequest {
    
    @NotNull(message = "Container ID is required")
    private Long containerId;
    
    @NotBlank(message = "Trucking company name is required")
    private String truckingCompanyName;
    
    @NotBlank(message = "Driver name is required")
    private String driverName;
    
    @Pattern(
        regexp = "^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$",
        message = "Valid vehicle number required (e.g., DL01AB1234)"
    )
    private String vehicleNumber;
    
    private LocalDateTime departureTime;
    
    private String notes;
}