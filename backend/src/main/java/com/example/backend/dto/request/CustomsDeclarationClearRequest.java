package com.example.backend.dto.request;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomsDeclarationClearRequest {
    
    @NotNull(message = "Cleared timestamp is required")
    private LocalDateTime clearedAt;
    
    private String remarks;
}