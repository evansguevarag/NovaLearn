package com.novalearn.student.dashboard.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.learning.certificate.repository.CertificateRepository;
import com.novalearn.learning.enrollment.entity.Enrollment;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.payment.enums.PaymentStatus;
import com.novalearn.payment.repository.PaymentRepository;
import com.novalearn.student.dashboard.dto.StudentCertificateDashboardResponse;
import com.novalearn.student.dashboard.dto.StudentCourseDashboardResponse;
import com.novalearn.student.dashboard.dto.StudentDashboardSummaryResponse;
import com.novalearn.student.dashboard.dto.StudentPaymentDashboardResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class StudentDashboardService {

    private final EnrollmentRepository enrollmentRepository;
    private final CertificateRepository certificateRepository;
    private final PaymentRepository paymentRepository;

    public StudentDashboardService(
            EnrollmentRepository enrollmentRepository,
            CertificateRepository certificateRepository,
            PaymentRepository paymentRepository
    ) {
        this.enrollmentRepository = enrollmentRepository;
        this.certificateRepository = certificateRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public StudentDashboardSummaryResponse getSummary(User student) {

        validateStudent(student);

        List<Enrollment> enrollments = enrollmentRepository
                .findByStudentIdAndDeletedAtIsNullOrderByEnrolledAtDesc(student.getId());

        long enrolledCourses = enrollments.size();

        long completedCourses = enrollments.stream()
                .filter(enrollment -> enrollment.getCompletedAt() != null)
                .count();

        long certificates = certificateRepository
                .findByEnrollmentStudentIdOrderByIssuedAtDesc(student.getId())
                .size();

        BigDecimal averageProgress = calculateAverageProgress(enrollments);

        BigDecimal totalPaid = paymentRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.PAID)
                .map(payment -> payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new StudentDashboardSummaryResponse(
                student.getId(),
                student.getEmail(),
                enrolledCourses,
                completedCourses,
                certificates,
                averageProgress,
                totalPaid
        );
    }

    @Transactional(readOnly = true)
    public List<StudentCourseDashboardResponse> getMyCourses(User student) {
        validateStudent(student);

        return enrollmentRepository
                .findByStudentIdAndDeletedAtIsNullOrderByEnrolledAtDesc(student.getId())
                .stream()
                .map(StudentCourseDashboardResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentCertificateDashboardResponse> getMyCertificates(User student) {
        validateStudent(student);

        return certificateRepository
                .findByEnrollmentStudentIdOrderByIssuedAtDesc(student.getId())
                .stream()
                .map(StudentCertificateDashboardResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentPaymentDashboardResponse> getMyPayments(User student) {
        validateStudent(student);

        return paymentRepository
                .findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(StudentPaymentDashboardResponse::new)
                .toList();
    }

    private BigDecimal calculateAverageProgress(List<Enrollment> enrollments) {

        if (enrollments.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalProgress = enrollments.stream()
                .map(enrollment -> enrollment.getProgressPercentage() != null
                        ? enrollment.getProgressPercentage()
                        : BigDecimal.ZERO
                )
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalProgress.divide(
                BigDecimal.valueOf(enrollments.size()),
                2,
                RoundingMode.HALF_UP
        );
    }

    private void validateStudent(User user) {
        if (user.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("Solo los estudiantes pueden acceder a este dashboard");
        }
    }
}