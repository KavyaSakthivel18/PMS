package com.example.backend.dto.response;

import com.example.backend.enums.MovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementLogResponse {
    
    private Long id;
    
    private Long containerId;
    
    private String containerNumber;
    
    private MovementType movementType;
    
    private String fromLocation;
    
    private String toLocation;
    
    private String containerStatusAtTime;
    
    private String performedByName;
    
    private String performedByRole;
    
    private LocalDateTime timestamp;
    
    private String notes;
    
    private Boolean isAutomatic;
}