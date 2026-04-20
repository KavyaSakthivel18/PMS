package com.example.backend.dto.response;

import com.example.backend.enums.ContainerStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long id;
    private Long containerId;
    private String containerNumber;
    private Long freightForwarderId;
    private String freightForwarderName;
    private Long shippingLineId;
    private String shippingLineName;
    private Long vesselScheduleId;
    private String vesselName;
    private ContainerStatus containerStatus;
    private LocalDateTime bookingDate;
    private LocalDate pickUpDate;
    private LocalDate deliveryDate;
}