package com.example.backend.repository;

import com.example.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByFreightForwarderId(Long freightForwarderId);

    List<Booking> findByContainerId(Long containerId);

    Optional<Booking> findByContainerIdAndFreightForwarderId(Long containerId, Long freightForwarderId);

    // JOIN query: fetch booking with container, customs, and vessel info
    @Query("""
            SELECT b FROM Booking b
            JOIN FETCH b.container c
            JOIN FETCH b.freightForwarder ff
            JOIN FETCH b.shippingLine sl
            JOIN FETCH b.vesselSchedule vs
            JOIN FETCH vs.vessel v
            WHERE b.id = :id
            """)
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    // Aggregate query: total containers handled per shipping line
    @Query("""
            SELECT b.shippingLine.companyName, COUNT(b.id)
            FROM Booking b
            GROUP BY b.shippingLine.companyName
            """)
    List<Object[]> countContainersPerShippingLine();
}