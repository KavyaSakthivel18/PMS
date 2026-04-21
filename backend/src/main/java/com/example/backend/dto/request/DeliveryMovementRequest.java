package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryMovementRequest {
    
    @NotNull(message = "Container ID is required")
    private Long containerId;
    
    @NotBlank(message = "Warehouse name is required")
    private String warehouseName;
    
    @NotBlank(message = "Recipient name is required")
    private String recipientName;
    
    @NotNull(message = "Delivery timestamp is required")
    private LocalDateTime deliveryTime;
    
    private String condition;
    
    private String signedBy;
    
    private String notes;
}