package com.example.backend.service.serviceImpl;

import com.example.backend.dto.request.CustomsDeclarationClearRequest;
import com.example.backend.dto.request.CustomsDeclarationHoldRequest;
import com.example.backend.dto.request.CustomsDeclarationRejectRequest;
import com.example.backend.dto.request.CustomsDeclarationRequest;
import com.example.backend.dto.request.CustomsDeclarationReviewRequest;
import com.example.backend.dto.response.CustomsDeclarationResponse;
import com.example.backend.entity.Container;
import com.example.backend.entity.CustomsDeclaration;
import com.example.backend.entity.User;
import com.example.backend.enums.ContainerStatus;
import com.example.backend.enums.CustomsStatus;
import com.example.backend.enums.UserRole;
import com.example.backend.repository.ContainerRepository;
import com.example.backend.repository.CustomsDeclarationRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.exception.*;
import com.example.backend.service.CustomsService;
import com.example.backend.service.MovementLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomsServiceImpl implements CustomsService {
    
    private final CustomsDeclarationRepository customsDeclarationRepository;
    private final ContainerRepository containerRepository;
    private final UserRepository userRepository;
    
    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private MovementLogService movementLogService;
    
    @Override
    @Transactional
    public CustomsDeclarationResponse fileDeclaration(
        CustomsDeclarationRequest request, 
        Long userId
    ) {
        log.info("Filing customs declaration for container {} by user {}", 
                 request.getContainerId(), userId);
        
        User officer = validateCustomsOfficer(userId);
        
        Container container = containerRepository.findById(request.getContainerId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Container not found: " + request.getContainerId()
            ));
        
        validateContainerEligibleForDeclaration(container);
        
        if (customsDeclarationRepository.hasActiveDeclaration(request.getContainerId())) {
            throw new ValidationException(
                "Container already has an active declaration"
            );
        }
        
        validateHSCodeFormat(request.getHsCode());
        
        if ("IMPORT".equals(request.getDeclarationType().name())) {
            if (request.getDeclaredValue() == null || request.getDeclaredValue() <= 0) {
                throw new ValidationException(
                    "Declared value is required for imports and must be greater than zero"
                );
            }
        }
        
        CustomsDeclaration declaration = CustomsDeclaration.builder()
            .container(container)
            .filedBy(officer)
            .declarationType(request.getDeclarationType())
            .customsStatus(CustomsStatus.PENDING)
            .hsCode(request.getHsCode())
            .declaredValue(request.getDeclaredValue())
            .inspectionRequired(request.getInspectionRequired())
            .remarks(request.getRemarks())
            .createdAt(LocalDateTime.now())
            .build();
        
        CustomsDeclaration saved = customsDeclarationRepository.save(declaration);
        
        if (request.getInspectionRequired()) {
            updateContainerStatus(container, ContainerStatus.CUSTOMS_HOLD);
        }
        
        movementLogService.createAutoMovementLog(
            container,
            "VESSEL_DISCHARGE_AREA",
            "CUSTOMS_AREA",
            officer,
            request.getInspectionRequired() ? "Declaration filed - inspection required" : "Declaration filed - pending review"
        );
        
        log.info("Customs declaration filed successfully: {}", saved.getId());
        return mapToResponse(saved);
    }
    
    @Override
    @Transactional
    public CustomsDeclarationResponse reviewDeclaration(
        Long declarationId,
        CustomsDeclarationReviewRequest request,
        Long userId
    ) {
        log.info("Reviewing customs declaration {}", declarationId);
        
        User officer = validateCustomsOfficer(userId);
        
        CustomsDeclaration declaration = getDeclarationEntity(declarationId);
        
        if (declaration.getCustomsStatus() != CustomsStatus.PENDING) {
            throw new InvalidStateException(
                "Can only review declarations in PENDING status"
            );
        }
        
        declaration.setCustomsStatus(CustomsStatus.UNDER_REVIEW);
        declaration.setInspectionRequired(request.getInspectionRequired());
        declaration.setUpdatedAt(LocalDateTime.now());
        
        CustomsDeclaration saved = customsDeclarationRepository.save(declaration);
        log.info("Declaration moved to UNDER_REVIEW: {}", declarationId);
        
        movementLogService.createAutoMovementLog(
            declaration.getContainer(),
            "CUSTOMS_AREA",
            "UNDER_REVIEW",
            officer,
            "Declaration moved to review by customs officer"
        );
        
        return mapToResponse(saved);
    }
    
    @Override
    @Transactional
    public CustomsDeclarationResponse clearDeclaration(
        Long declarationId,
        CustomsDeclarationClearRequest request,
        Long userId
    ) {
        log.info("Clearing customs declaration {}", declarationId);
        
        User officer = validateCustomsOfficer(userId);
        
        CustomsDeclaration declaration = getDeclarationEntity(declarationId);
        
        if (declaration.getCustomsStatus() != CustomsStatus.UNDER_REVIEW) {
            throw new InvalidStateException(
                "Declaration must be UNDER_REVIEW to clear. Current status: " + 
                declaration.getCustomsStatus()
            );
        }
        
        declaration.setCustomsStatus(CustomsStatus.CLEARED);
        declaration.setClearedAt(request.getClearedAt());
        declaration.setRemarks(request.getRemarks());
        declaration.setUpdatedAt(LocalDateTime.now());
        
        CustomsDeclaration saved = customsDeclarationRepository.save(declaration);
        
        updateContainerStatus(declaration.getContainer(), ContainerStatus.CLEARED);
        
        movementLogService.createAutoMovementLog(
            declaration.getContainer(),
            "CUSTOMS_HOLD",
            "CLEARED",
            officer,
            "Customs clearance granted"
        );
        
        log.info("Declaration cleared successfully: {}", declarationId);
        return mapToResponse(saved);
    }
    
    @Override
    @Transactional
    public CustomsDeclarationResponse holdDeclaration(
        Long declarationId,
        CustomsDeclarationHoldRequest request,
        Long userId
    ) {
        log.warn("HOLD requested for declaration {}", declarationId);
        
        User officer = validateCustomsOfficer(userId);
        
        CustomsDeclaration declaration = getDeclarationEntity(declarationId);
        
        if (declaration.getCustomsStatus() == CustomsStatus.PENDING || 
            declaration.getCustomsStatus() == CustomsStatus.REJECTED) {
            throw new InvalidStateException(
                "Cannot hold declaration in " + declaration.getCustomsStatus() + " status"
            );
        }
        
        declaration.setCustomsStatus(CustomsStatus.HELD);
        declaration.setRemarks("HOLD: " + request.getHoldReason() + 
                              (request.getAdditionalNotes() != null ? 
                               " | " + request.getAdditionalNotes() : ""));
        declaration.setUpdatedAt(LocalDateTime.now());
        
        CustomsDeclaration saved = customsDeclarationRepository.save(declaration);
        
        updateContainerStatus(declaration.getContainer(), ContainerStatus.CUSTOMS_HOLD);
        
        movementLogService.createAutoMovementLog(
            declaration.getContainer(),
            "CUSTOMS_AREA",
            "HELD",
            officer,
            "Container HELD - " + request.getHoldReason()
        );
        
        log.warn("Container HELD: {} - Reason: {}", 
                 declaration.getContainer().getContainerNumber(), 
                 request.getHoldReason());
        
        return mapToResponse(saved);
    }
    
    @Override
    @Transactional
    public CustomsDeclarationResponse rejectDeclaration(
        Long declarationId,
        CustomsDeclarationRejectRequest request,
        Long userId
    ) {
        log.warn("Rejecting customs declaration {}", declarationId);
        
        User officer = validateCustomsOfficer(userId);
        
        CustomsDeclaration declaration = getDeclarationEntity(declarationId);
        
        if (declaration.getCustomsStatus() != CustomsStatus.UNDER_REVIEW) {
            throw new InvalidStateException(
                "Can only reject declarations in UNDER_REVIEW status"
            );
        }
        
        declaration.setCustomsStatus(CustomsStatus.REJECTED);
        declaration.setRemarks("REJECTED: " + request.getRejectionReason() + 
                              (request.getRemarks() != null ? 
                               " | " + request.getRemarks() : ""));
        declaration.setUpdatedAt(LocalDateTime.now());
        
        CustomsDeclaration saved = customsDeclarationRepository.save(declaration);
        
        movementLogService.createAutoMovementLog(
            declaration.getContainer(),
            "UNDER_REVIEW",
            "REJECTED",
            officer,
            "Declaration rejected: " + request.getRejectionReason()
        );
        
        log.warn("Declaration rejected: {} - Reason: {}", 
                 declarationId, 
                 request.getRejectionReason());
        
        return mapToResponse(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public CustomsDeclarationResponse getDeclaration(Long declarationId) {
        CustomsDeclaration declaration = getDeclarationEntity(declarationId);
        return mapToResponse(declaration);
    }
    
    @Override
    @Transactional(readOnly = true)
    public CustomsDeclarationResponse getDeclarationByContainer(Long containerId) {
        log.debug("Fetching customs declaration for container {}", containerId);
        
        CustomsDeclaration declaration = customsDeclarationRepository
            .findLatestByContainerId(containerId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "No customs declaration found for container: " + containerId
            ));
        
        return mapToResponse(declaration);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isContainerCleared(Long containerId) {
        return customsDeclarationRepository
            .findLatestByContainerId(containerId)
            .map(cd -> cd.getCustomsStatus() == CustomsStatus.CLEARED)
            .orElse(false);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isContainerOnHold(Long containerId) {
        return customsDeclarationRepository
            .findLatestByContainerId(containerId)
            .map(cd -> cd.getCustomsStatus() == CustomsStatus.HELD)
            .orElse(false);
    }
        
    private User validateCustomsOfficer(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        
        if (user.getRole() != UserRole.CUSTOMS_OFFICER) {
            throw new PermissionException(
                "Only CUSTOMS_OFFICER can perform this operation"
            );
        }
        
        return user;
    }
    
    private void validateContainerEligibleForDeclaration(Container container) {
        ContainerStatus status = container.getStatus();
        
        if (!status.name().equals("ARRIVED")) {
            throw new InvalidStateException(
                "Container must be ARRIVED for customs declaration. " +
                "Current status: " + status
            );
        }
    }
    
    private void validateHSCodeFormat(String hsCode) {
        if (hsCode == null || !hsCode.matches("^\\d{6,10}$")) {
            throw new ValidationException(
                "HS Code must be 6-10 digits. Provided: " + hsCode
            );
        }
    }
    
    private void updateContainerStatus(Container container, ContainerStatus status) {
        container.setStatus(status);
        containerRepository.save(container);
        log.debug("Container {} status updated to {}", 
                  container.getContainerNumber(), status);
    }
    
    private CustomsDeclaration getDeclarationEntity(Long declarationId) {
        return customsDeclarationRepository.findById(declarationId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "CustomsDeclaration not found: " + declarationId
            ));
    }
    
    private CustomsDeclarationResponse mapToResponse(CustomsDeclaration declaration) {
        return CustomsDeclarationResponse.builder()
            .id(declaration.getId())
            .containerId(declaration.getContainer().getId())
            .containerNumber(declaration.getContainer().getContainerNumber())
            .declarationType(declaration.getDeclarationType())
            .customsStatus(declaration.getCustomsStatus())
            .hsCode(declaration.getHsCode())
            .declaredValue(declaration.getDeclaredValue())
            .inspectionRequired(declaration.getInspectionRequired())
            .filedByName(declaration.getFiledBy().getName())
            .filedByRole(declaration.getFiledBy().getRole().name())
            .createdAt(declaration.getCreatedAt())
            .clearedAt(declaration.getClearedAt())
            .updatedAt(declaration.getUpdatedAt())
            .remarks(declaration.getRemarks())
            .isMovementBlocked(declaration.isMovementBlocked())
            .build();
    }
}