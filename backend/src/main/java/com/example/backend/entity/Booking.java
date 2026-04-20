package com.example.backend.entity;

import com.example.backend.enums.ContainerStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "container_id", nullable = false)
    private Container container;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freight_forwarder_id", nullable = false)
    private User freightForwarder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_line_id", nullable = false)
    private User shippingLine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vessel_schedule_id", nullable = false)
    private VesselSchedule vesselSchedule;

    @Enumerated(EnumType.STRING)
    @Column(name = "container_status", nullable = false)
    private ContainerStatus containerStatus;

    @Column(name = "booking_date", nullable = false)
    private LocalDateTime bookingDate;

    @Column(name = "pick_up_date")
    private LocalDate pickUpDate;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;
}