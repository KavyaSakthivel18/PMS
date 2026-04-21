package com.example.backend.entity;

import com.example.backend.enums.MovementType;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "movement_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
   
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "container_id", nullable = false)
    private Container container;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType movementType;
    
    @Column(nullable = false, length = 100)
    private String fromLocation;

    @Column(nullable = false, length = 100)
    private String toLocation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id", nullable = false)
    private User performedBy;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @Column(nullable = false, length = 50)
    private String containerStatusAtTime;

    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(nullable = false)
    private Boolean isAutomatic = false;
    
    public boolean isMovementAllowed(CustomsDeclaration customsDeclaration) {
        if (customsDeclaration == null) {
            return false; // No customs declaration = cannot move
        }
        return customsDeclaration.getCustomsStatus().allowsMovement();
    }
    
    public boolean isGateOutMovement() {
        return this.movementType == MovementType.GATE_OUT;
    }

    @PreUpdate
    protected void preventUpdate() {
        throw new UnsupportedOperationException(
            "MovementLog entries are immutable - cannot be updated"
        );
    }
}