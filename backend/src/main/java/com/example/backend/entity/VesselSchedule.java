package com.example.backend.entity;

import com.example.backend.enums.ScheduleStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "vessel_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VesselSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vessel_id")
    private Vessel vessel;

    private String portOfOrigin;

    private String portOfDestination;

    private LocalDateTime arrivalDate;

    private LocalDateTime departureDate;

    @Enumerated(EnumType.STRING)
    private ScheduleStatus status;

}
