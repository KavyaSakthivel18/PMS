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
        """)
    List<CustomsDeclaration> findLatestByContainerIdPageable(@Param("containerId") Long containerId, org.springframework.data.domain.Pageable pageable);

    default Optional<CustomsDeclaration> findLatestByContainerId(Long containerId) {
        List<CustomsDeclaration> results = findLatestByContainerIdPageable(containerId, org.springframework.data.domain.PageRequest.of(0, 1));
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }
    
    List<CustomsDeclaration> findByContainerId(@Param("containerId") Long containerId);
    
    List<CustomsDeclaration> findByCustomsStatus(@Param("status") CustomsStatus status);
    
    List<CustomsDeclaration> findByDeclarationType(@Param("type") DeclarationType declarationType);
    
    @Query("""
        SELECT cd FROM CustomsDeclaration cd 
        WHERE cd.customsStatus = com.example.backend.enums.CustomsStatus.HELD
        """)
    List<CustomsDeclaration> findAllHeldDeclarations();
    
    @Query("""
        SELECT cd FROM CustomsDeclaration cd 
        WHERE cd.customsStatus IN (com.example.backend.enums.CustomsStatus.PENDING, com.example.backend.enums.CustomsStatus.UNDER_REVIEW)
        ORDER BY cd.createdAt ASC
        """)
    List<CustomsDeclaration> findPendingReviewDeclarations();
    
    @Query("""
        SELECT cd FROM CustomsDeclaration cd 
        WHERE cd.inspectionRequired = true 
        AND cd.customsStatus != com.example.backend.enums.CustomsStatus.CLEARED
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
        AND cd.customsStatus NOT IN (com.example.backend.enums.CustomsStatus.CLEARED, com.example.backend.enums.CustomsStatus.REJECTED)
        """)
    boolean hasActiveDeclaration(@Param("containerId") Long containerId);
    
    @Query("""
        SELECT cd FROM CustomsDeclaration cd 
        WHERE cd.declarationType = com.example.backend.enums.DeclarationType.IMPORT 
        AND cd.declaredValue >= :minValue
        ORDER BY cd.declaredValue DESC
        """)
    List<CustomsDeclaration> findHighValueImports(@Param("minValue") Double minValue);
    
    @Query("""
        SELECT AVG(TIMESTAMPDIFF(SECOND, cd.createdAt, cd.clearedAt)) / 60.0 
        FROM CustomsDeclaration cd 
        WHERE cd.filedBy.id = :officerId 
        AND cd.customsStatus = com.example.backend.enums.CustomsStatus.CLEARED
        """)
    Double getAverageClearanceTimeByOfficer(@Param("officerId") Long officerId);
}