package com.example.backend.controller;

import com.example.backend.dto.request.MovementLogRequest;
import com.example.backend.dto.response.ContainerMovementTrackingResponse;
import com.example.backend.dto.response.MovementLogResponse;
import com.example.backend.service.MovementLogService;
import com.example.backend.exception.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/movement-logs")
@RequiredArgsConstructor
public class MovementLogController {
    
    private final MovementLogService movementLogService;
      
    @PostMapping
    public ResponseEntity<ApiResponse<MovementLogResponse>> createMovementLog(
        @Valid @RequestBody MovementLogRequest request,
        Authentication authentication
    ) {
        log.info("Creating movement log for container {} - type: {}", 
                 request.getContainerId(), request.getMovementType());
        
        Long userId = extractUserId(authentication);
        MovementLogResponse response = movementLogService.createMovementLog(request, userId);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Movement log created", response));
    }
    
    @GetMapping("/container/{containerId}")
    public ResponseEntity<ApiResponse<List<MovementLogResponse>>> getContainerMovements(
        @PathVariable Long containerId
    ) {
        log.debug("Fetching movements for container {}", containerId);
        
        List<MovementLogResponse> movements = movementLogService.getContainerMovements(containerId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Movements retrieved", movements)
        );
    }
    
    @GetMapping("/tracking/{containerId}")
    public ResponseEntity<ApiResponse<ContainerMovementTrackingResponse>> getContainerTracking(
        @PathVariable Long containerId
    ) {
        log.debug("Fetching tracking info for container {}", containerId);
        
        ContainerMovementTrackingResponse tracking = 
            movementLogService.getContainerTrackingInfo(containerId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Container tracking retrieved", tracking)
        );
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovementLogResponse>> getMovement(
        @PathVariable Long id
    ) {
        log.debug("Fetching movement log {}", id);
        
        return ResponseEntity.ok(
            ApiResponse.success("Movement retrieved", null)
        );
    }
     
    @GetMapping("/latest/{containerId}")
    public ResponseEntity<ApiResponse<MovementLogResponse>> getLatestMovement(
        @PathVariable Long containerId
    ) {
        log.debug("Fetching latest movement for container {}", containerId);
        
        MovementLogResponse response = movementLogService.getLatestMovement(containerId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Latest movement retrieved", response)
        );
    }
    
    
    @GetMapping("/gate-outs")
    public ResponseEntity<ApiResponse<List<MovementLogResponse>>> getGateOutMovements() {
        log.debug("Fetching all gate-out movements");
        
        List<MovementLogResponse> movements = movementLogService.getGateOutMovements();
        
        return ResponseEntity.ok(
            ApiResponse.success("Gate-out movements retrieved", movements)
        );
    }

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<List<MovementLogResponse>>> getDeliveries() {
        log.debug("Fetching all delivery movements");
        
        List<MovementLogResponse> movements = movementLogService.getDeliveries();
        
        return ResponseEntity.ok(
            ApiResponse.success("Deliveries retrieved", movements)
        );
    }
    
    private Long extractUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof Long) {
            return (Long) principal;
        } else if (principal instanceof String) {
            try {
                return Long.parseLong((String) principal);
            } catch (NumberFormatException e) {
                log.error("Could not parse user ID from authentication", e);
                throw new IllegalArgumentException("Invalid user ID in authentication");
            }
        }
        
        throw new IllegalArgumentException("Could not extract user ID from authentication");
    }
}