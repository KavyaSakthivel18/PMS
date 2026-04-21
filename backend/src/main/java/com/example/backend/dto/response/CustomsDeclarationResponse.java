package com.example.backend.dto.response;

import java.time.LocalDateTime;

import com.example.backend.enums.CustomsStatus;
import com.example.backend.enums.DeclarationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomsDeclarationResponse {
    
    private Long id;
    
    private Long containerId;
    
    private String containerNumber;
    
    private DeclarationType declarationType;
    
    private CustomsStatus customsStatus;
    
    private String hsCode;
    
    private Double declaredValue;
    
    private Boolean inspectionRequired;
    
    private String filedByName;
    
    private String filedByRole;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime clearedAt;
    
    private LocalDateTime updatedAt;
    
    private String remarks;
    
    private Boolean isMovementBlocked;
}