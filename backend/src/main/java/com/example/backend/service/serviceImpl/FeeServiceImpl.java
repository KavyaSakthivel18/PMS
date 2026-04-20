package com.example.backend.service.serviceImpl;

import com.example.backend.dto.request.FeeCalculationRequest;
import com.example.backend.dto.response.FeeInvoiceResponse;
import com.example.backend.dto.response.FeeResponse;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Container;
import com.example.backend.entity.PortStorageFee;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.ContainerRepository;
import com.example.backend.repository.PortStorageFeeRepository;
import com.example.backend.service.FeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@AllArgsConstructor
@NoArgsConstructor
public class FeeServiceImpl implements FeeService {

    // Business rule constants
    private static final int FREE_DAYS = 7;
    private static final BigDecimal DEMURRAGE_RATE_20FT = new BigDecimal("1000"); // ₹1,000/day
    private static final BigDecimal DEMURRAGE_RATE_40FT = new BigDecimal("1500"); // ₹1,500/day
    private static final BigDecimal DETENTION_RATE = new BigDecimal("2000");      // ₹2,000/day
    private static final BigDecimal FEE_PER_DAY_BASE = new BigDecimal("500");     // Base storage fee per day

    private final PortStorageFeeRepository portStorageFeeRepository;
    private final ContainerRepository containerRepository;
    private final BookingRepository bookingRepository;

    // ── Get Fee by Container ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public FeeResponse getFeeByContainer(Long containerId) {
        // Ensure container exists
        containerRepository.findById(containerId)
                .orElseThrow(() -> new ResourceNotFoundException("Container not found with id: " + containerId));

        PortStorageFee fee = portStorageFeeRepository.findByContainerId(containerId)
                .orElseThrow(() -> new ResourceNotFoundException("No fee record found for container id: " + containerId));

        return mapToFeeResponse(fee);
    }

    // ── Calculate Fee ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public FeeResponse calculateFee(FeeCalculationRequest request) {
        Container container = containerRepository.findById(request.getContainerId())
                .orElseThrow(() -> new ResourceNotFoundException("Container not found with id: " + request.getContainerId()));

        LocalDate storageEnd = request.getStorageEndDate();
        if (storageEnd == null) {
            storageEnd = LocalDate.now();
        }

        // Find or create fee record
        PortStorageFee fee = portStorageFeeRepository.findByContainerId(container.getId())
                .orElseGet(() -> {
                    // storageStartDate = the day the container arrived (today if no record)
                    return PortStorageFee.builder()
                            .container(container)
                            .freeDays(FREE_DAYS)
                            .storageStartDate(LocalDate.now())
                            .feePerDay(FEE_PER_DAY_BASE)
                            .paymentStatus(PaymentStatus.UNPAID)
                            .build();
                });

        fee.setStorageEndDate(storageEnd);

        // Days stored = storageEnd - storageStart (inclusive start, exclusive end → +1)
        long daysStored = ChronoUnit.DAYS.between(fee.getStorageStartDate(), storageEnd);
        if (daysStored < 0) {
            throw new ValidationException("Storage end date cannot be before storage start date.");
        }
        fee.setDaysStored((int) daysStored);

        // ── Storage Fee ──────────────────────────────────────────────────────
        // Storage Fee = max(0, DaysStored - FreeDays) × FeePerDay
        long billableDays = Math.max(0, daysStored - FREE_DAYS);
        BigDecimal storageFee = fee.getFeePerDay().multiply(BigDecimal.valueOf(billableDays));
        fee.setStorageFee(storageFee);

        // ── Demurrage Fee ────────────────────────────────────────────────────
        // Applies if container not picked up within free period
        BigDecimal demurrageRate = getDemurrageRate(container);
        long overStayDays = Math.max(0, daysStored - FREE_DAYS);
        BigDecimal demurrageFee = demurrageRate.multiply(BigDecimal.valueOf(overStayDays));
        fee.setDemurrageFee(demurrageFee);

        // ── Detention Fee ────────────────────────────────────────────────────
        // Applies if container not returned after delivery
        BigDecimal detentionFee = BigDecimal.ZERO;
        if (request.getExpectedReturnDate() != null) {
            LocalDate actualReturn = request.getActualReturnDate() != null
                    ? request.getActualReturnDate()
                    : LocalDate.now();
            long detentionDays = Math.max(0,
                    ChronoUnit.DAYS.between(request.getExpectedReturnDate(), actualReturn));
            detentionFee = DETENTION_RATE.multiply(BigDecimal.valueOf(detentionDays));
        }
        fee.setDetentionFee(detentionFee);

        // ── Total Fee ────────────────────────────────────────────────────────
        // Total Fee = StorageFee + DemurrageFee + DetentionFee
        BigDecimal totalFee = storageFee.add(demurrageFee).add(detentionFee);
        fee.setTotalFee(totalFee);

        PortStorageFee saved = portStorageFeeRepository.save(fee);
        return mapToFeeResponse(saved);
    }

    // ── Generate Invoice ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public FeeInvoiceResponse getInvoice(Long containerId) {
        Container container = containerRepository.findById(containerId)
                .orElseThrow(() -> new ResourceNotFoundException("Container not found with id: " + containerId));

        PortStorageFee fee = portStorageFeeRepository.findByContainerId(containerId)
                .orElseThrow(() -> new ResourceNotFoundException("No fee record found for container id: " + containerId));

        // Try to pull booking info for this container
        List<Booking> bookings = bookingRepository.findByContainerId(containerId);
        String freightForwarderName = bookings.isEmpty() ? "N/A" : bookings.get(0).getFreightForwarder().getName();
        String shippingLineName = bookings.isEmpty() ? "N/A" : bookings.get(0).getShippingLine().getCompanyName();

        long daysStored = fee.getDaysStored();
        long billableDays = Math.max(0, daysStored - fee.getFreeDays());

        return FeeInvoiceResponse.builder()
                .invoiceNumber("INV-" + containerId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .containerId(container.getId())
                .containerNumber(container.getContainerNumber())
                .containerType(container.getContainerType().name())
                .sizeTEU(container.getSizeTEU())
                .freightForwarderName(freightForwarderName)
                .shippingLineName(shippingLineName)
                .freeDays(fee.getFreeDays())
                .daysStored((int) daysStored)
                .billableDays((int) billableDays)
                .feePerDay(fee.getFeePerDay())
                .storageFee(fee.getStorageFee())
                .demurrageFee(fee.getDemurrageFee())
                .detentionFee(fee.getDetentionFee())
                .totalFee(fee.getTotalFee())
                .paymentStatus(fee.getPaymentStatus())
                .storageStartDate(fee.getStorageStartDate())
                .storageEndDate(fee.getStorageEndDate())
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    /**
     * Returns the demurrage rate based on container size.
     * 20ft → ₹1,000/day | 40ft/45ft → ₹1,500/day
     */
    private BigDecimal getDemurrageRate(Container container) {
        int size = container.getSizeTEU();
        if (size == 20) {
            return DEMURRAGE_RATE_20FT;
        } else {
            // 40ft and 45ft both use the higher rate
            return DEMURRAGE_RATE_40FT;
        }
    }

    private FeeResponse mapToFeeResponse(PortStorageFee fee) {
        return FeeResponse.builder()
                .id(fee.getId())
                .containerId(fee.getContainer().getId())
                .containerNumber(fee.getContainer().getContainerNumber())
                .freeDays(fee.getFreeDays())
                .storageStartDate(fee.getStorageStartDate())
                .storageEndDate(fee.getStorageEndDate())
                .daysStored(fee.getDaysStored())
                .feePerDay(fee.getFeePerDay())
                .storageFee(fee.getStorageFee())
                .demurrageFee(fee.getDemurrageFee())
                .detentionFee(fee.getDetentionFee())
                .totalFee(fee.getTotalFee())
                .paymentStatus(fee.getPaymentStatus())
                .build();
    }
}