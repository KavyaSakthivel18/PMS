package com.example.backend.service;

import com.example.backend.dto.request.VesselScheduleRequest;
import com.example.backend.dto.response.VesselScheduleResponse;

import java.util.List;

public interface VesselScheduleService {

    VesselScheduleResponse createSchedule(VesselScheduleRequest request);

    List<VesselScheduleResponse> getAllSchedules();

}