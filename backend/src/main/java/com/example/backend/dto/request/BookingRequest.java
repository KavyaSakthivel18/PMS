package com.example.backend.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {

    @NotNull(message = "Container ID is required")
    private Long containerId;

    @NotNull(message = "Freight Forwarder ID is required")
    private Long freightForwarderId;

    @NotNull(message = "Shipping Line ID is required")
    private Long shippingLineId;

    @NotNull(message = "Vessel Schedule ID is required")
    private Long vesselScheduleId;

    @NotNull(message = "Pick-up date is required")
    @FutureOrPresent(message = "Pick-up date must be today or in the future")
    private LocalDate pickUpDate;

    @FutureOrPresent(message = "Delivery date must be today or in the future")
    private LocalDate deliveryDate;
}