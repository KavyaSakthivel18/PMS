package com.example.backend.repository;

import com.example.backend.entity.MovementLog;
import com.example.backend.enums.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MovementLogRepository extends JpaRepository<MovementLog, Long> {
    
    @Query("""
        SELECT ml FROM MovementLog ml 
        WHERE ml.container.id = :containerId 
        ORDER BY ml.timestamp ASC
        """)
    List<MovementLog> findByContainerId(@Param("containerId") Long containerId);
    
    @Query("""
        SELECT ml FROM MovementLog ml 
        WHERE ml.container.id = :containerId 
        ORDER BY ml.timestamp DESC 
        LIMIT 1
        """)
    Optional<MovementLog> findMostRecentByContainerId(@Param("containerId") Long containerId);
    
    List<MovementLog> findByMovementType(@Param("movementType") MovementType movementType);
    
    @Query("""
        SELECT ml FROM MovementLog ml 
        WHERE ml.movementType = 'GATE_OUT'
        ORDER BY ml.timestamp DESC
        """)
    List<MovementLog> findAllGateOutMovements();
    
    @Query("""
        SELECT ml FROM MovementLog ml 
        WHERE ml.movementType = 'DELIVERY'
        ORDER BY ml.timestamp DESC
        """)
    List<MovementLog> findAllDeliveries();
    
    @Query("""
        SELECT ml FROM MovementLog ml 
        WHERE ml.performedBy.id = :userId
        ORDER BY ml.timestamp DESC
        """)
    List<MovementLog> findByPerformedById(@Param("userId") Long userId);
   
    @Query("""
        SELECT ml FROM MovementLog ml 
        WHERE ml.container.id = :containerId 
        AND ml.isAutomatic = :isAutomatic
        ORDER BY ml.timestamp ASC
        """)
    List<MovementLog> findByContainerIdAndAutomatic(
        @Param("containerId") Long containerId,
        @Param("isAutomatic") Boolean isAutomatic
    );
    
    @Query("""
        SELECT ml FROM MovementLog ml 
        WHERE ml.timestamp BETWEEN :startDate AND :endDate
        ORDER BY ml.timestamp ASC
        """)
    List<MovementLog> findByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("""
        SELECT ml FROM MovementLog ml 
        WHERE ml.fromLocation = :location OR ml.toLocation = :location
        ORDER BY ml.timestamp DESC
        """)
    List<MovementLog> findByLocation(@Param("location") String location);
    
    @Query("""
        SELECT EXTRACT(DAY FROM (
            (SELECT ml.timestamp FROM MovementLog ml 
             WHERE ml.container.id = :containerId 
             AND ml.movementType IN ('DELIVERY', 'GATE_OUT')
             ORDER BY ml.timestamp DESC LIMIT 1) 
            - 
            (SELECT ml.timestamp FROM MovementLog ml 
             WHERE ml.container.id = :containerId 
             AND ml.movementType = 'VESSEL_DISCHARGE'
             LIMIT 1)
        )) 
        FROM dual
        """)
    Integer calculateDwellTime(@Param("containerId") Long containerId);
    
    @Query("""
        SELECT DISTINCT ml.container FROM MovementLog ml 
        WHERE ml.container.id IN (
            SELECT ml2.container.id FROM MovementLog ml2 
            GROUP BY ml2.container.id 
            HAVING EXTRACT(DAY FROM (MAX(ml2.timestamp) - MIN(ml2.timestamp))) >= :minDays
        )
        """)
    List<MovementLog> findContainersWithExtendedDwellTime(@Param("minDays") Integer minDays);
    
    @Query("""
        SELECT COUNT(ml) FROM MovementLog ml 
        WHERE ml.container.id = :containerId
        """)
    Long countMovementsForContainer(@Param("containerId") Long containerId);
    
    @Query("""
        SELECT COUNT(ml) > 0 FROM MovementLog ml 
        WHERE ml.container.id = :containerId 
        AND ml.movementType = 'GATE_OUT'
        """)
    boolean hasGateOutMovement(@Param("containerId") Long containerId);
    
    @Query("""
        SELECT EXTRACT(HOUR FROM (
            (SELECT ml.timestamp FROM MovementLog ml 
             WHERE ml.container.id = :containerId 
             AND ml.movementType = 'GATE_OUT' LIMIT 1)
            - 
            (SELECT ml.timestamp FROM MovementLog ml 
             WHERE ml.container.id = :containerId 
             AND ml.movementType = 'VESSEL_DISCHARGE' LIMIT 1)
        )) 
        FROM dual
        """)
    Long calculateStorageDuration(@Param("containerId") Long containerId);
}