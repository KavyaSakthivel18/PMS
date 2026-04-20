package com.example.backend.dto.response;

import com.example.backend.enums.ScheduleStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VesselScheduleResponse {

    private Long id;
    private String vesselName;
    private String portOfOrigin;
    private String portOfDestination;
    private LocalDateTime arrivalDate;
    private LocalDateTime departureDate;
    private ScheduleStatus status;

}
