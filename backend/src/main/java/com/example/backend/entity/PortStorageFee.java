package com.example.backend.entity;

import com.example.backend.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "port_storage_fees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortStorageFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "container_id", nullable = false)
    private Container container;

    @Column(name = "free_days", nullable = false)
    private int freeDays = 7;

    @Column(name = "storage_start_date", nullable = false)
    private LocalDate storageStartDate;

    @Column(name = "storage_end_date")
    private LocalDate storageEndDate;

    @Column(name = "days_stored")
    private int daysStored;

    @Column(name = "fee_per_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal feePerDay;

    @Column(name = "storage_fee", precision = 12, scale = 2)
    private BigDecimal storageFee;

    @Column(name = "demurrage_fee", precision = 12, scale = 2)
    private BigDecimal demurrageFee;

    @Column(name = "detention_fee", precision = 12, scale = 2)
    private BigDecimal detentionFee;

    @Column(name = "total_fee", precision = 12, scale = 2)
    private BigDecimal totalFee;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;
}