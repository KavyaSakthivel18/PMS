package com.example.backend.repository;

import com.example.backend.entity.PortStorageFee;
import com.example.backend.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PortStorageFeeRepository extends JpaRepository<PortStorageFee, Long> {

    Optional<PortStorageFee> findByContainerId(Long containerId);

    List<PortStorageFee> findByPaymentStatus(PaymentStatus paymentStatus);

    // Aggregate query: total demurrage fees collected per month
    @Query("""
            SELECT MONTH(p.storageEndDate), YEAR(p.storageEndDate), SUM(p.totalFee)
            FROM PortStorageFee p
            WHERE p.paymentStatus = 'PAID'
            GROUP BY YEAR(p.storageEndDate), MONTH(p.storageEndDate)
            ORDER BY YEAR(p.storageEndDate) DESC, MONTH(p.storageEndDate) DESC
            """)
    List<Object[]> totalFeesCollectedPerMonth();

    // Containers with unpaid fees older than X days
    @Query("""
            SELECT p FROM PortStorageFee p
            WHERE p.paymentStatus = :status
            AND p.storageStartDate <= :cutoffDate
            """)
    List<PortStorageFee> findByPaymentStatusAndStorageStartDateBefore(
            @Param("status") PaymentStatus status,
            @Param("cutoffDate") LocalDate cutoffDate);
}