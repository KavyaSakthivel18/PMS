package com.example.backend.service;

import com.example.backend.entity.Container;
import com.example.backend.entity.User;
import com.example.backend.dto.request.MovementLogRequest;
import com.example.backend.dto.response.ContainerMovementTrackingResponse;
import com.example.backend.dto.response.MovementLogResponse;


import java.util.List;

public interface MovementLogService {
    
    MovementLogResponse createMovementLog(MovementLogRequest request, Long userId);
    
    void createAutoMovementLog(Container container, String fromLocation, String toLocation, User user, String notes);
    
    ContainerMovementTrackingResponse getContainerTrackingInfo(Long containerId);
    
    List<MovementLogResponse> getContainerMovements(Long containerId);
    
    MovementLogResponse getLatestMovement(Long containerId);
    
    List<MovementLogResponse> getGateOutMovements();
    
    List<MovementLogResponse> getDeliveries();
    
    boolean hasExitedPort(Long containerId);
    
    Long calculateDwellTime(Long containerId);
}