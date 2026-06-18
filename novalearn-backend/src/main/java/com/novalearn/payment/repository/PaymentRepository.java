package com.novalearn.payment.repository;

import com.novalearn.payment.entity.Payment;
import com.novalearn.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

        Optional<Payment> findByIdAndStudentId(Long id, Long studentId);

        List<Payment> findByStudentIdOrderByCreatedAtDesc(Long studentId);

        List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);

        List<Payment> findAllByOrderByCreatedAtDesc();

        @Query(
        """
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.status = com.novalearn.payment.enums.PaymentStatus.PAID
        """
        )
        BigDecimal calculateTotalRevenue();

        @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.status = com.novalearn.payment.enums.PaymentStatus.PAID
        AND p.course.instructor.id = :instructorId
        """)
        BigDecimal calculateRevenueByInstructor(
                @Param("instructorId") Long instructorId
        );

        @Query(
        value = """
                SELECT 
                        TO_CHAR(created_at, 'YYYY-MM') AS month,
                        COALESCE(SUM(amount), 0) AS revenue
                FROM payments
                WHERE status = 'PAID'
                GROUP BY TO_CHAR(created_at, 'YYYY-MM')
                ORDER BY month ASC
                """,
        nativeQuery = true
        )
        List<Object[]> calculateRevenueByMonth();
}