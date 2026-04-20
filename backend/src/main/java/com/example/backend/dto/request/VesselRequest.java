package com.example.backend.dto.request;

import com.example.backend.enums.VesselStatus;
import lombok.Data;

@Data
public class VesselRequest {

    private String vesselName;
    private String vesselCode;
    private String lineName;
    private Integer capacityTEU;
    private VesselStatus status;

}