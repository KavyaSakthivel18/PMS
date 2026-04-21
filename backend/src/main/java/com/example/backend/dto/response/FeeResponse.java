package com.example.backend.dto.response;

import com.example.backend.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeResponse {

    private Long id;
    private Long containerId;
    private String containerNumber;
    private int freeDays;
    private LocalDate storageStartDate;
    private LocalDate storageEndDate;
    private int daysStored;
    private BigDecimal feePerDay;
    private BigDecimal storageFee;
    private BigDecimal demurrageFee;
    private BigDecimal detentionFee;
    private BigDecimal totalFee;
    private PaymentStatus paymentStatus;
}