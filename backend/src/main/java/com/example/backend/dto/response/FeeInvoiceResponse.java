package com.example.backend.dto.response;

import com.example.backend.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeInvoiceResponse {

    private String invoiceNumber;
    private Long containerId;
    private String containerNumber;
    private String containerType;
    private int sizeTEU;

    // Booking info
    private String freightForwarderName;
    private String shippingLineName;

    // Fee breakdown
    private int freeDays;
    private int daysStored;
    private int billableDays;
    private BigDecimal feePerDay;
    private BigDecimal storageFee;
    private BigDecimal demurrageFee;
    private BigDecimal detentionFee;
    private BigDecimal totalFee;

    private PaymentStatus paymentStatus;
    private LocalDate storageStartDate;
    private LocalDate storageEndDate;
    private LocalDateTime generatedAt;
}