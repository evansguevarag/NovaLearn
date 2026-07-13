package com.novalearn.payment.repository;

import com.novalearn.payment.entity.Payment;
import com.novalearn.payment.enums.PaymentProvider;
import com.novalearn.payment.enums.PaymentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

        Optional<Payment> findByIdAndStudentId(Long id, Long studentId);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("""
        SELECT p
        FROM Payment p
        WHERE p.id = :id
        AND p.student.id = :studentId
        """)
        Optional<Payment> findByIdAndStudentIdForUpdate(
                @Param("id") Long id,
                @Param("studentId") Long studentId
        );

        Optional<Payment> findFirstByStudentIdAndCourseIdAndCurrencyAndAmountAndStatusOrderByCreatedAtDesc(
                Long studentId,
                Long courseId,
                String currency,
                BigDecimal amount,
                PaymentStatus status
        );

        Optional<Payment> findByProviderOrderId(String providerOrderId);

        List<Payment> findByStudentIdOrderByCreatedAtDesc(Long studentId);

        List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);

        List<Payment> findByStatusOrderByPaidAtDesc(PaymentStatus status);

        List<Payment> findByProviderOrderByCreatedAtDesc(PaymentProvider provider);

        List<Payment> findByProviderAndStatusOrderByCreatedAtDesc(
                PaymentProvider provider,
                PaymentStatus status
        );

        Optional<Payment> findFirstByStudentIdAndCourseIdAndProviderAndStatusOrderByCreatedAtDesc(
                Long studentId,
                Long courseId,
                PaymentProvider provider,
                PaymentStatus status
        );

        Optional<Payment> findFirstByStudentIdAndCourseIdAndStatusOrderByCreatedAtDesc(
                Long studentId,
                Long courseId,
                PaymentStatus status
        );

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

}
