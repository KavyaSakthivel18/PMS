package com.example.backend.dto.response;

import com.example.backend.enums.VesselStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VesselResponse {

    private Long id;
    private String vesselName;
    private String vesselCode;
    private String lineName;
    private Integer capacityTEU;
    private VesselStatus status;

}
