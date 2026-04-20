package com.example.backend.entity;

import com.example.backend.enums.ContainerStatus;
import com.example.backend.enums.ContainerType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "containers")
public class Container {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "container_number", nullable = false, unique = true)
    private String containerNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "container_type", nullable = false)
    private ContainerType containerType;

    @Column(name = "size_teu", nullable = false)
    private Integer sizeTEU;

    @Column(name = "seal_number")
    private String sealNumber;

    @Column(name = "cargo_description")
    private String cargoDescription;

    @Column(name = "weight_kg", nullable = false)
    private Double weightKG;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContainerStatus status;

    // Use Long type referencing for decoupled entity associations.
    // If you add User/VesselSchedule entities later, use @ManyToOne / @JoinColumn instead.
    @Column(name = "vessel_schedule_id")
    private Long vesselScheduleId;

    @Column(name = "shipping_line_id")
    private Long shippingLineId;
}
