package com.example.backend.dto.response;

import com.example.backend.enums.ContainerStatus;
import com.example.backend.enums.ContainerType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ContainerResponse {
    private Long id;
    private String containerNumber;
    private ContainerType containerType;
    private Integer sizeTEU;
    private String sealNumber;
    private String cargoDescription;
    private Double weightKG;
    private ContainerStatus status;
    private Long vesselScheduleId;
    private Long shippingLineId;
}
