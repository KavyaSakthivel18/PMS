package com.example.backend.service.serviceImpl;

import com.example.backend.dto.request.MovementLogRequest;
import com.example.backend.dto.response.ContainerMovementTrackingResponse;
import com.example.backend.dto.response.MovementLogResponse;
import com.example.backend.entity.Container;
import com.example.backend.entity.MovementLog;
import com.example.backend.entity.User;
import com.example.backend.enums.ContainerStatus;
import com.example.backend.enums.MovementType;
import com.example.backend.repository.ContainerRepository;
import com.example.backend.repository.MovementLogRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.exception.*;
import com.example.backend.service.CustomsService;
import com.example.backend.service.MovementLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MovementLogServiceImpl implements MovementLogService {
    
    private final MovementLogRepository movementLogRepository;
    private final ContainerRepository containerRepository;
    private final UserRepository userRepository;
    private final CustomsService customsService;
    
    @Override
    @Transactional
    public MovementLogResponse createMovementLog(
        MovementLogRequest request,
        Long userId
    ) {
        log.info("Creating movement log for container {} - type: {}", 
                 request.getContainerId(), request.getMovementType());
        
        Container container = containerRepository.findById(request.getContainerId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Container not found: " + request.getContainerId()
            ));
        
        if (customsService.isContainerOnHold(container.getId())) {
            throw new BlockedException(
                "Container is HELD - movement not permitted. " +
                "Must be cleared by customs officer."
            );
        }
        
        if (request.getMovementType() == MovementType.GATE_OUT) {
            validateGateOutMovement(container);
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        
        MovementLog movementLog = MovementLog.builder()
            .container(container)
            .movementType(request.getMovementType())
            .fromLocation(request.getFromLocation())
            .toLocation(request.getToLocation())
            .timestamp(request.getTimestamp() != null ? 
                      request.getTimestamp() : LocalDateTime.now())
            .containerStatusAtTime(container.getStatus().name())
            .performedBy(user)
            .notes(request.getNotes())
            .isAutomatic(false)
            .build();
        
        MovementLog saved = movementLogRepository.save(movementLog);
        
        updateContainerStatusFromMovement(container, request.getMovementType());
        
        log.info("Movement log created successfully: {}", saved.getId());
        return mapToResponse(saved);
    }
    
    @Override
    @Transactional
    public void createAutoMovementLog(
        Container container,
        String fromLocation,
        String toLocation,
        User user,
        String notes
    ) {
        log.debug("Auto-creating movement log for container {}", 
                  container.getContainerNumber());
        
        MovementType type = inferMovementType(fromLocation, toLocation);
        
        MovementLog movementLog = MovementLog.builder()
            .container(container)
            .movementType(type)
            .fromLocation(fromLocation)
            .toLocation(toLocation)
            .timestamp(LocalDateTime.now())
            .containerStatusAtTime(container.getStatus().name())
            .performedBy(user)
            .notes(notes)
            .isAutomatic(true) 
            .build();
        
        movementLogRepository.save(movementLog);
        log.debug("Auto movement log created for: {}", container.getContainerNumber());
    }
    
    @Override
    @Transactional(readOnly = true)
    public ContainerMovementTrackingResponse getContainerTrackingInfo(Long containerId) {
        log.debug("Fetching tracking info for container {}", containerId);
        
        Container container = containerRepository.findById(containerId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Container not found: " + containerId
            ));
        
        List<MovementLog> movements = movementLogRepository.findByContainerId(containerId);
        
        if (movements.isEmpty()) {
            throw new ResourceNotFoundException(
                "No movement logs found for container: " + containerId
            );
        }
        
        LocalDateTime arrivedAt = movements.stream()
            .filter(m -> m.getMovementType() == MovementType.VESSEL_DISCHARGE)
            .map(MovementLog::getTimestamp)
            .findFirst()
            .orElse(null);
        
        LocalDateTime clearedAt = movements.stream()
            .filter(m -> "CLEARED".equals(m.getToLocation()))
            .map(MovementLog::getTimestamp)
            .findFirst()
            .orElse(null);
        
        LocalDateTime deliveredAt = movements.stream()
            .filter(m -> m.getMovementType() == MovementType.DELIVERY)
            .map(MovementLog::getTimestamp)
            .findFirst()
            .orElse(null);
        
        String durationInPort = "Not delivered";
        if (deliveredAt != null && arrivedAt != null) {
            long days = ChronoUnit.DAYS.between(arrivedAt, deliveredAt);
            long hours = ChronoUnit.HOURS.between(arrivedAt, deliveredAt) % 24;
            durationInPort = String.format("%d days, %d hours", days, hours);
        }
        
        return ContainerMovementTrackingResponse.builder()
            .containerId(container.getId())
            .containerNumber(container.getContainerNumber())
            .currentStatus(container.getStatus().name())
            .customsStatus(getLatestCustomsStatus(containerId))
            .arrivedAt(arrivedAt)
            .clearedAt(clearedAt)
            .deliveredAt(deliveredAt)
            .movementHistory(movements.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()))
            .totalDurationInPort(durationInPort)
            .totalMovements(movements.size())
            .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MovementLogResponse> getContainerMovements(Long containerId) {
        log.debug("Fetching movements for container {}", containerId);
        
        List<MovementLog> logs = movementLogRepository.findByContainerId(containerId);
        
        if (logs.isEmpty()) {
            throw new ResourceNotFoundException(
                "No movements found for container: " + containerId
            );
        }
        
        return logs.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public MovementLogResponse getLatestMovement(Long containerId) {
        MovementLog latest = movementLogRepository.findMostRecentByContainerId(containerId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "No movements found for container: " + containerId
            ));
        
        return mapToResponse(latest);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MovementLogResponse> getGateOutMovements() {
        return movementLogRepository.findAllGateOutMovements().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MovementLogResponse> getDeliveries() {
        return movementLogRepository.findAllDeliveries().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasExitedPort(Long containerId) {
        return movementLogRepository.hasGateOutMovement(containerId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long calculateDwellTime(Long containerId) {
        List<MovementLog> movements = movementLogRepository.findByContainerId(containerId);
        
        if (movements.isEmpty()) {
            return 0L;
        }
        
        LocalDateTime arrival = movements.stream()
            .filter(m -> m.getMovementType() == MovementType.VESSEL_DISCHARGE)
            .map(MovementLog::getTimestamp)
            .findFirst()
            .orElse(null);
        
        LocalDateTime exit = movements.stream()
            .filter(m -> m.getMovementType() == MovementType.GATE_OUT || 
                        m.getMovementType() == MovementType.DELIVERY)
            .map(MovementLog::getTimestamp)
            .findFirst()
            .orElse(null);
        
        if (arrival == null || exit == null) {
            return null; 
        }
        
        return ChronoUnit.DAYS.between(arrival, exit);
    }
    
    // ===================== PRIVATE HELPER METHODS =====================
    
    private void validateGateOutMovement(Container container) {
        if (!customsService.isContainerCleared(container.getId())) {
            throw new InvalidStateException(
                "Customs clearance required before GATE_OUT. " +
                "Container is not cleared by customs officer."
            );
        }
        
        if (container.getStatus() != ContainerStatus.CLEARED) {
            throw new InvalidStateException(
                "Container must be CLEARED status for gate-out. " +
                "Current status: " + container.getStatus()
            );
        }
    }
    
    private void updateContainerStatusFromMovement(
        Container container, 
        MovementType movementType
    ) {
        ContainerStatus newStatus = switch (movementType) {
            case VESSEL_DISCHARGE -> ContainerStatus.ARRIVED;
            case YARD_MOVE -> ContainerStatus.YARD_STORAGE;
            case GATE_OUT -> ContainerStatus.GATE_OUT;
            case DELIVERY -> ContainerStatus.DELIVERED;
        };
        
        container.setStatus(newStatus);
        containerRepository.save(container);
        log.debug("Container {} status updated to {}", 
                  container.getContainerNumber(), newStatus);
    }
    
    private MovementType inferMovementType(String fromLocation, String toLocation) {
        if ("VESSEL_DISCHARGE_AREA".equals(toLocation)) {
            return MovementType.VESSEL_DISCHARGE;
        } else if ("YARD_STORAGE".equals(toLocation)) {
            return MovementType.YARD_MOVE;
        } else if ("GATE".equals(toLocation)) {
            return MovementType.GATE_OUT;
        } else if ("WAREHOUSE".equals(toLocation) || "DELIVERY".equals(toLocation)) {
            return MovementType.DELIVERY;
        }
        return MovementType.YARD_MOVE;
    }
    
    private String getLatestCustomsStatus(Long containerId) {
        try {
            return customsService
                .getDeclarationByContainer(containerId)
                .getCustomsStatus()
                .name();
        } catch (ResourceNotFoundException e) {
            return "NO_DECLARATION";
        }
    }
    
    private MovementLogResponse mapToResponse(MovementLog log) {
        return MovementLogResponse.builder()
            .id(log.getId())
            .containerId(log.getContainer().getId())
            .containerNumber(log.getContainer().getContainerNumber())
            .movementType(log.getMovementType())
            .fromLocation(log.getFromLocation())
            .toLocation(log.getToLocation())
            .containerStatusAtTime(log.getContainerStatusAtTime())
            .performedByName(log.getPerformedBy().getName())
            .performedByRole(log.getPerformedBy().getRole().name())
            .timestamp(log.getTimestamp())
            .notes(log.getNotes())
            .isAutomatic(log.getIsAutomatic())
            .build();
    }
}