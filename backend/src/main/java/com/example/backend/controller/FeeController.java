package com.example.backend.controller;

import com.example.backend.dto.request.FeeCalculationRequest;
import com.example.backend.dto.response.FeeInvoiceResponse;
import com.example.backend.dto.response.FeeResponse;
import com.example.backend.service.FeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService feeService;

    /**
     * GET /api/fees/container/{containerId}
     * Get the current fee record for a container.
     * Accessible by: ADMIN, FREIGHT_FORWARDER, SHIPPING_LINE
     */
    @GetMapping("/container/{containerId}")
    public ResponseEntity<FeeResponse> getFeeByContainer(@PathVariable Long containerId) {
        return ResponseEntity.ok(feeService.getFeeByContainer(containerId));
    }

    /**
     * POST /api/fees/calculate
     * Calculate (or recalculate) storage, demurrage, and detention fees for a container.
     * System-triggered but also callable by ADMIN.
     *
     * Fee Formula:
     *   Storage Fee  = max(0, DaysStored - 7) × FeePerDay
     *   Demurrage    = OverstayDays × Rate (₹1000/day for 20ft, ₹1500/day for 40ft+)
     *   Detention    = DelayDays × ₹2000/day
     *   Total        = StorageFee + DemurrageFee + DetentionFee
     */
    @PostMapping("/calculate")
    public ResponseEntity<FeeResponse> calculateFee(@Valid @RequestBody FeeCalculationRequest request) {
        return ResponseEntity.ok(feeService.calculateFee(request));
    }

    /**
     * GET /api/fees/invoice/{containerId}
     * Generate a full fee invoice for a container.
     * Accessible by: ADMIN, FREIGHT_FORWARDER
     */
    @GetMapping("/invoice/{containerId}")
    public ResponseEntity<FeeInvoiceResponse> getInvoice(@PathVariable Long containerId) {
        return ResponseEntity.ok(feeService.getInvoice(containerId));
    }
}