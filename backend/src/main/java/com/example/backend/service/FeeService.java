package com.example.backend.service;

import com.example.backend.dto.request.FeeCalculationRequest;
import com.example.backend.dto.response.FeeInvoiceResponse;
import com.example.backend.dto.response.FeeResponse;

public interface FeeService {

    FeeResponse getFeeByContainer(Long containerId);

    FeeResponse calculateFee(FeeCalculationRequest request);

    FeeInvoiceResponse getInvoice(Long containerId);
}