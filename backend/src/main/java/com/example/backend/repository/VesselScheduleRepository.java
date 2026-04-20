package com.example.backend.repository;

import com.example.backend.entity.VesselSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VesselScheduleRepository extends JpaRepository<VesselSchedule, Long> {
}