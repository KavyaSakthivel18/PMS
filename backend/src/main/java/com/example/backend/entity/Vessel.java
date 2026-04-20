package com.example.backend.entity;

import com.example.backend.enums.VesselStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vessels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vessel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vesselName;

    private String vesselCode;

    private String lineName;

    private Integer capacityTEU;

    @Enumerated(EnumType.STRING)
    private VesselStatus status;

}