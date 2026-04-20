package com.example.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomsDeclarationReviewRequest {
    
    @NotNull(message = "Inspection required flag must be specified")
    private Boolean inspectionRequired;
    
    private String reviewNotes;
}