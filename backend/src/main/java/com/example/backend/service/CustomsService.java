package com.example.backend.service;

import com.example.backend.dto.request.CustomsDeclarationClearRequest;
import com.example.backend.dto.request.CustomsDeclarationHoldRequest;
import com.example.backend.dto.request.CustomsDeclarationRejectRequest;
import com.example.backend.dto.request.CustomsDeclarationRequest;
import com.example.backend.dto.request.CustomsDeclarationReviewRequest;
import com.example.backend.dto.response.CustomsDeclarationResponse;


public interface CustomsService {
    
    CustomsDeclarationResponse fileDeclaration(CustomsDeclarationRequest request, Long userId);
    
    CustomsDeclarationResponse reviewDeclaration(Long declarationId, CustomsDeclarationReviewRequest request, Long userId);
    
    CustomsDeclarationResponse clearDeclaration(Long declarationId, CustomsDeclarationClearRequest request, Long userId);
    
    CustomsDeclarationResponse holdDeclaration(Long declarationId, CustomsDeclarationHoldRequest request, Long userId);
    
    CustomsDeclarationResponse rejectDeclaration(Long declarationId, CustomsDeclarationRejectRequest request, Long userId);
    
    CustomsDeclarationResponse getDeclaration(Long declarationId);
    
    CustomsDeclarationResponse getDeclarationByContainer(Long containerId);
    
    boolean isContainerCleared(Long containerId);
    
    boolean isContainerOnHold(Long containerId);
}