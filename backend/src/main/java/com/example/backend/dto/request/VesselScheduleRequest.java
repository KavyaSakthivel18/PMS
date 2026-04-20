package com.example.backend.dto.request;

import com.example.backend.enums.ScheduleStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VesselScheduleRequest {

    private Long vesselId;
    private String portOfOrigin;
    private String portOfDestination;
    private LocalDateTime arrivalDate;
    private LocalDateTime departureDate;
    private ScheduleStatus status;

}