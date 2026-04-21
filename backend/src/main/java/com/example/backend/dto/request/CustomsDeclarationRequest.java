package com.example.backend.dto.request;
 
import com.example.backend.enums.DeclarationType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

 
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomsDeclarationRequest {
    
    @NotNull(message = "Container ID is required")
    private Long containerId;
    
    @NotNull(message = "Declaration type is required")
    private DeclarationType declarationType;
    
    @NotBlank(message = "HS Code is required")
    @Pattern(
        regexp = "^\\d{6,10}$",
        message = "HS Code must be 6-10 digits"
    )
    private String hsCode;
    
    @Min(value = 0, message = "Declared value must be non-negative")
    private Double declaredValue;
    
    @NotNull(message = "Inspection required flag must be specified")
    private Boolean inspectionRequired;
    
    private String remarks;
}