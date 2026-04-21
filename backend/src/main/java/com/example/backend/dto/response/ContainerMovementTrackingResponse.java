package com.example.backend.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContainerMovementTrackingResponse {
    
    private Long containerId;
    
    private String containerNumber;
    
    private String currentStatus;
    
    private String customsStatus;
    
    private LocalDateTime arrivedAt;
    
    private LocalDateTime clearedAt;
    
    private LocalDateTime deliveredAt;
    
    private java.util.List<MovementLogResponse> movementHistory;
    
    private String totalDurationInPort;

    private Integer totalMovements;
}