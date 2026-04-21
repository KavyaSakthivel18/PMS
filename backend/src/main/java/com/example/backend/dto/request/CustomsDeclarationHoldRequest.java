package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomsDeclarationHoldRequest {
    
    @NotBlank(message = "Hold reason is required")
    private String holdReason;
    
    private String additionalNotes;
}