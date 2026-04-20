package com.example.backend.service.serviceImpl;

import com.example.backend.dto.request.VesselRequest;
import com.example.backend.dto.response.VesselResponse;
import com.example.backend.entity.Vessel;
import com.example.backend.repository.VesselRepository;
import com.example.backend.service.VesselService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VesselServiceImpl implements VesselService {

    private final VesselRepository vesselRepository;

    @Override
    public VesselResponse createVessel(VesselRequest request) {

        Vessel vessel = Vessel.builder()
                .vesselName(request.getVesselName())
                .vesselCode(request.getVesselCode())
                .lineName(request.getLineName())
                .capacityTEU(request.getCapacityTEU())
                .status(request.getStatus())
                .build();

        vessel = vesselRepository.save(vessel);

        return mapToResponse(vessel);
    }

    @Override
    public List<VesselResponse> getAllVessels() {
        return vesselRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VesselResponse mapToResponse(Vessel vessel) {

        return VesselResponse.builder()
                .id(vessel.getId())
                .vesselName(vessel.getVesselName())
                .vesselCode(vessel.getVesselCode())
                .lineName(vessel.getLineName())
                .capacityTEU(vessel.getCapacityTEU())
                .status(vessel.getStatus())
                .build();
    }
}