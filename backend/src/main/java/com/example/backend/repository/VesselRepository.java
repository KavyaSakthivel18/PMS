package com.example.backend.repository;

import com.example.backend.entity.Vessel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VesselRepository extends JpaRepository<Vessel, Long> {
}
