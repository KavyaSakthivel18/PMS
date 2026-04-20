package com.example.backend.dto.request;

import com.example.backend.enums.MovementType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementLogRequest {
    
    @NotNull(message = "Container ID is required")
    private Long containerId;
    
    @NotNull(message = "Movement type is required")
    private MovementType movementType;
    
    @NotBlank(message = "From location is required")
    @Size(max = 100, message = "From location must be max 100 characters")
    private String fromLocation;
    
    @NotBlank(message = "To location is required")
    @Size(max = 100, message = "To location must be max 100 characters")
    private String toLocation;
    
    @NotNull(message = "Timestamp is required")
    private LocalDateTime timestamp;
    
    @Size(max = 500, message = "Notes must be max 500 characters")
    private String notes;
}