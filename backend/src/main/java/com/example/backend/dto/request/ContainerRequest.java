package com.example.backend.dto.request;

import com.example.backend.enums.ContainerType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ContainerRequest {

    @NotBlank(message = "Container number is required")
    @Pattern(regexp = "^[A-Za-z]{4}\\d{7}$", message = "Container number format must be 4 letters followed by 7 digits (e.g., MSCU1234567)")
    private String containerNumber;

    @NotNull(message = "Container type is required")
    private ContainerType containerType;

    @NotNull(message = "Size TEU is required")
    private Integer sizeTEU; // Supported sizes 20, 40, 45

    private String sealNumber;

    private String cargoDescription;

    @NotNull(message = "Weight is required")
    @Min(value = 1, message = "Weight must be greater than 0")
    private Double weightKG;

    private Long vesselScheduleId;

    private Long shippingLineId;
}
