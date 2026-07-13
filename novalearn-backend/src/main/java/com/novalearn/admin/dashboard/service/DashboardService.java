package com.novalearn.admin.dashboard.service;

import com.novalearn.admin.dashboard.dto.*;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.core.user.repository.UserRepository;
import com.novalearn.learning.certificate.repository.CertificateRepository;
import com.novalearn.learning.course.enums.CourseStatus;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.List;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificateRepository certificateRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(
            UserRepository userRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            CertificateRepository certificateRepository,
            PaymentRepository paymentRepository
    ) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.certificateRepository = certificateRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        return new DashboardSummaryResponse(
                userRepository.countByRole(UserRole.STUDENT),
                userRepository.countByRole(UserRole.INSTRUCTOR),
                courseRepository.countByDeletedAtIsNull(),
                courseRepository.countByStatusAndDeletedAtIsNull(CourseStatus.PUBLISHED),
                enrollmentRepository.countByDeletedAtIsNull(),
                enrollmentRepository.countByCompletedAtIsNotNullAndDeletedAtIsNull(),
                certificateRepository.count(),
                paymentRepository.calculateTotalRevenue()
        );
    }

    @Transactional(readOnly = true)
    public List<LatestStudentResponse> getLatestStudents() {
        return userRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .filter(user -> user.getRole() == UserRole.STUDENT)
                .map(LatestStudentResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LatestEnrollmentResponse> getLatestEnrollments() {
        return enrollmentRepository.findTop10ByDeletedAtIsNullOrderByEnrolledAtDesc()
                .stream()
                .map(LatestEnrollmentResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TopCourseResponse> getTopCourses() {
        return enrollmentRepository.findTopCoursesByEnrollments()
                .stream()
                .map(row -> new TopCourseResponse(
                        toLong(row[0]),
                        String.valueOf(row[1]),
                        toLong(row[2])
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RevenuePaymentResponse> getRevenue() {
        return paymentRepository.findByStatusOrderByPaidAtDesc(
                        com.novalearn.payment.enums.PaymentStatus.PAID
                )
                .stream()
                .map(RevenuePaymentResponse::new)
                .toList();
    }

    private Long toLong(Object value) {
        if (value instanceof BigInteger bigInteger) {
            return bigInteger.longValue();
        }

        if (value instanceof Number number) {
            return number.longValue();
        }

        return Long.parseLong(String.valueOf(value));
    }

}
