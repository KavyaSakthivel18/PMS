package com.example.backend.entity;

import com.example.backend.enums.CustomsStatus;
import com.example.backend.enums.DeclarationType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "customs_declarations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomsDeclaration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "container_id", nullable = false)
    private Container container;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeclarationType declarationType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filed_by_id", nullable = false)
    private User filedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomsStatus customsStatus = CustomsStatus.PENDING;
    
    @Column(nullable = false, length = 10)
    private String hsCode;
    
    @Column
    private Double declaredValue;
    
    @Column(nullable = false)
    private Boolean inspectionRequired = false;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column
    private LocalDateTime clearedAt;
    
    @Column(columnDefinition = "TEXT")
    private String remarks;
    
    @Column
    private LocalDateTime updatedAt;
    
    public boolean isContainerEligibleForDeclaration() {
        if (this.container == null) return false;
        return "ARRIVED".equals(this.container.getStatus().name());
    }
  
    public boolean isTerminal() {
        return customsStatus == CustomsStatus.CLEARED || 
               customsStatus == CustomsStatus.REJECTED;
    }
    
    public boolean isMovementBlocked() {
        return customsStatus == CustomsStatus.HELD;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}