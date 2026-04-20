package com.example.backend.controller;

import com.example.backend.dto.request.VesselRequest;
import com.example.backend.dto.request.VesselScheduleRequest;
import com.example.backend.dto.response.VesselResponse;
import com.example.backend.dto.response.VesselScheduleResponse;
import com.example.backend.service.VesselScheduleService;
import com.example.backend.service.VesselService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VesselController {

    private final VesselService vesselService;
    private final VesselScheduleService scheduleService;

    @PostMapping("/vessels")
    public VesselResponse createVessel(@RequestBody VesselRequest request) {
        return vesselService.createVessel(request);
    }

    @GetMapping("/vessels")
    public List<VesselResponse> getAllVessels() {
        return vesselService.getAllVessels();
    }

    @PostMapping("/vessel-schedules")
    public VesselScheduleResponse createSchedule(
            @RequestBody VesselScheduleRequest request) {

        return scheduleService.createSchedule(request);
    }

    @GetMapping("/vessel-schedules")
    public List<VesselScheduleResponse> getSchedules() {
        return scheduleService.getAllSchedules();
    }
}