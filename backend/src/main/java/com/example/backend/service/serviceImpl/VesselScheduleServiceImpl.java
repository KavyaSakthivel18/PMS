package com.example.backend.service.serviceImpl;

import com.example.backend.dto.request.VesselScheduleRequest;
import com.example.backend.dto.response.VesselScheduleResponse;
import com.example.backend.entity.Vessel;
import com.example.backend.entity.VesselSchedule;
import com.example.backend.repository.VesselRepository;
import com.example.backend.repository.VesselScheduleRepository;
import com.example.backend.service.VesselScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VesselScheduleServiceImpl implements VesselScheduleService {

    private final VesselScheduleRepository scheduleRepository;
    private final VesselRepository vesselRepository;

    @Override
    public VesselScheduleResponse createSchedule(VesselScheduleRequest request) {

        Vessel vessel = vesselRepository.findById(request.getVesselId())
                .orElseThrow(() -> new RuntimeException("Vessel not found"));

        VesselSchedule schedule = VesselSchedule.builder()
                .vessel(vessel)
                .portOfOrigin(request.getPortOfOrigin())
                .portOfDestination(request.getPortOfDestination())
                .arrivalDate(request.getArrivalDate())
                .departureDate(request.getDepartureDate())
                .status(request.getStatus())
                .build();

        schedule = scheduleRepository.save(schedule);

        return mapToResponse(schedule);
    }

    @Override
    public List<VesselScheduleResponse> getAllSchedules() {

        return scheduleRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VesselScheduleResponse mapToResponse(VesselSchedule schedule) {

        return VesselScheduleResponse.builder()
                .id(schedule.getId())
                .vesselName(schedule.getVessel().getVesselName())
                .portOfOrigin(schedule.getPortOfOrigin())
                .portOfDestination(schedule.getPortOfDestination())
                .arrivalDate(schedule.getArrivalDate())
                .departureDate(schedule.getDepartureDate())
                .status(schedule.getStatus())
                .build();
    }
}
