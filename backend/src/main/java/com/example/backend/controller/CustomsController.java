package com.example.backend.controller;


import com.example.backend.service.CustomsService;
import com.example.backend.exception.ApiResponse;
import com.example.backend.dto.request.CustomsDeclarationClearRequest;
import com.example.backend.dto.request.CustomsDeclarationHoldRequest;
import com.example.backend.dto.request.CustomsDeclarationRejectRequest;
import com.example.backend.dto.request.CustomsDeclarationRequest;
import com.example.backend.dto.request.CustomsDeclarationReviewRequest;
import com.example.backend.dto.response.CustomsDeclarationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/api/customs")
@RequiredArgsConstructor
public class CustomsController {
    
    private final CustomsService customsService;
      
    @PostMapping("/declaration")
    public ResponseEntity<ApiResponse<CustomsDeclarationResponse>> fileDeclaration(
        @Valid @RequestBody CustomsDeclarationRequest request,
        Authentication authentication
    ) {
        log.info("Received declaration filing request for container {}", 
                 request.getContainerId());
        
        Long userId = extractUserId(authentication);
        CustomsDeclarationResponse response = customsService.fileDeclaration(request, userId);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Declaration filed successfully", response));
    }
    
    @PutMapping("/declaration/{id}/review")
    public ResponseEntity<ApiResponse<CustomsDeclarationResponse>> reviewDeclaration(
        @PathVariable Long id,
        @Valid @RequestBody CustomsDeclarationReviewRequest request,
        Authentication authentication
    ) {
        log.info("Reviewing customs declaration {}", id);
        
        Long userId = extractUserId(authentication);
        CustomsDeclarationResponse response = customsService.reviewDeclaration(id, request, userId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Declaration moved to review", response)
        );
    }
    
    @PutMapping("/declaration/{id}/clear")
    public ResponseEntity<ApiResponse<CustomsDeclarationResponse>> clearDeclaration(
        @PathVariable Long id,
        @Valid @RequestBody CustomsDeclarationClearRequest request,
        Authentication authentication
    ) {
        log.info("Clearing customs declaration {}", id);
        
        Long userId = extractUserId(authentication);
        CustomsDeclarationResponse response = customsService.clearDeclaration(id, request, userId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Declaration cleared successfully", response)
        );
    }
    
    @PutMapping("/declaration/{id}/hold")
    public ResponseEntity<ApiResponse<CustomsDeclarationResponse>> holdDeclaration(
        @PathVariable Long id,
        @Valid @RequestBody CustomsDeclarationHoldRequest request,
        Authentication authentication
    ) {
        log.warn("HOLD operation initiated for declaration {}", id);
        
        Long userId = extractUserId(authentication);
        CustomsDeclarationResponse response = customsService.holdDeclaration(id, request, userId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Declaration HELD - container movement blocked", response)
        );
    }
    
    @PutMapping("/declaration/{id}/reject")
    public ResponseEntity<ApiResponse<CustomsDeclarationResponse>> rejectDeclaration(
        @PathVariable Long id,
        @Valid @RequestBody CustomsDeclarationRejectRequest request,
        Authentication authentication
    ) {
        log.warn("Rejecting customs declaration {}", id);
        
        Long userId = extractUserId(authentication);
        CustomsDeclarationResponse response = customsService.rejectDeclaration(id, request, userId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Declaration REJECTED", response)
        );
    }
    
    
    @GetMapping("/declaration/{id}")
    public ResponseEntity<ApiResponse<CustomsDeclarationResponse>> getDeclaration(
        @PathVariable Long id
    ) {
        log.debug("Fetching customs declaration {}", id);
        
        CustomsDeclarationResponse response = customsService.getDeclaration(id);
        
        return ResponseEntity.ok(
            ApiResponse.success("Declaration retrieved", response)
        );
    }

    @GetMapping("/declaration/container/{containerId}")
    public ResponseEntity<ApiResponse<CustomsDeclarationResponse>> getDeclarationByContainer(
        @PathVariable Long containerId
    ) {
        log.debug("Fetching customs declaration for container {}", containerId);
        
        CustomsDeclarationResponse response = customsService.getDeclarationByContainer(containerId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Declaration retrieved", response)
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