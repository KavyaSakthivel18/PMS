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
public class CustomsDeclarationRejectRequest {
    
    @NotBlank(message = "Rejection reason is required")
    private String rejectionReason;
    
    private String remarks;
}