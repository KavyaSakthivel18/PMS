package com.example.backend.service;

import com.example.backend.dto.request.VesselRequest;
import com.example.backend.dto.response.VesselResponse;

import java.util.List;

public interface VesselService {

    VesselResponse createVessel(VesselRequest request);

    List<VesselResponse> getAllVessels();

}