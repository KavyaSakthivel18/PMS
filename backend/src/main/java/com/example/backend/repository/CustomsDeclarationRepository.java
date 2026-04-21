package com.example.backend.repository;

import com.example.backend.entity.CustomsDeclaration;
import com.example.backend.enums.CustomsStatus;
import com.example.backend.enums.DeclarationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomsDeclarationRepository extends JpaRepository<CustomsDeclaration, Long> {
    
    @Query(value = """
        SELECT cd FROM CustomsDeclaration cd 
        WHERE cd.container.id = :containerId 
        ORDER BY cd.createdAt DESC 
        LIMIT 1
        """)
    Optional<CustomsDeclaration> findLatestByContainerId(@Param("containerId") Long containerId);
    
    List<CustomsDeclaration> findByContainerId(@Param("containerId") Long containerId);
    
    List<CustomsDeclaration> findByCustomsStatus(@Param("status") CustomsStatus status);
    
    List<CustomsDeclaration> findByDeclarationType(@Param("type") DeclarationType declarationType);
    
    @Query("""
        SELECT cd FROM CustomsDeclaration cd 
        WHERE cd.customsStatus = 'HELD'
        """)
    List<CustomsDeclaration> findAllHeldDeclarations();
    
    @Query("""
        SELECT cd FROM CustomsDeclaration cd 
        WHERE cd.customsStatus IN ('PENDING', 'UNDER_REVIEW')
        ORDER BY cd.createdAt ASC
        """)
    List<CustomsDeclaration> findPendingReviewDeclarations();
    
    @Query("""
        SELECT cd FROM CustomsDeclaration cd 
        WHERE cd.inspectionRequired = true 
        AND cd.customsStatus != 'CLEARED'
        """)
    List<CustomsDeclaration> findDeclarationsRequiringInspection();
    
    @Query("""
        SELECT cd FROM CustomsDeclaration cd 
        WHERE cd.filedBy.id = :officerId
        ORDER BY cd.createdAt DESC
        """)
    List<CustomsDeclaration> findByCustomsOfficerId(@Param("officerId") Long officerId);
    
    @Query("""
        SELECT cd FROM CustomsDeclaration cd 
        WHERE cd.clearedAt BETWEEN :startDate AND :endDate
        ORDER BY cd.clearedAt DESC
        """)
    List<CustomsDeclaration> findClearedInDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("""
        SELECT COUNT(cd) > 0 FROM CustomsDeclaration cd 
        WHERE cd.container.id = :containerId 
        AND cd.customsStatus NOT IN ('CLEARED', 'REJECTED')
        """)
    boolean hasActiveDeclaration(@Param("containerId") Long containerId);
    
    @Query("""
        SELECT cd FROM CustomsDeclaration cd 
        WHERE cd.declarationType = 'IMPORT' 
        AND cd.declaredValue >= :minValue
        ORDER BY cd.declaredValue DESC
        """)
    List<CustomsDeclaration> findHighValueImports(@Param("minValue") Double minValue);
    
    @Query("""
        SELECT AVG((CAST(EXTRACT(EPOCH FROM cd.clearedAt) AS double) - CAST(EXTRACT(EPOCH FROM cd.createdAt) AS double)) / 60.0) 
        FROM CustomsDeclaration cd 
        WHERE cd.filedBy.id = :officerId 
        AND cd.customsStatus = 'CLEARED'
        """)
    Double getAverageClearanceTimeByOfficer(@Param("officerId") Long officerId);
}