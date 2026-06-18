package com.novalearn.instructor.dashboard.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.instructor.dashboard.dto.InstructorCourseResponse;
import com.novalearn.instructor.dashboard.dto.InstructorDashboardSummaryResponse;
import com.novalearn.instructor.dashboard.dto.InstructorEnrollmentResponse;
import com.novalearn.learning.course.enums.CourseStatus;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InstructorDashboardService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;

    public InstructorDashboardService(
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            PaymentRepository paymentRepository
    ) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public InstructorDashboardSummaryResponse getSummary(User instructor) {

        validateInstructor(instructor);

        return new InstructorDashboardSummaryResponse(
                instructor.getId(),
                instructor.getEmail(),
                courseRepository.countByInstructorIdAndDeletedAtIsNull(instructor.getId()),
                courseRepository.countByInstructorIdAndStatusAndDeletedAtIsNull(
                        instructor.getId(),
                        CourseStatus.PUBLISHED
                ),
                courseRepository.countByInstructorIdAndStatusAndDeletedAtIsNull(
                        instructor.getId(),
                        CourseStatus.DRAFT
                ),
                enrollmentRepository.countByCourseInstructorIdAndDeletedAtIsNull(instructor.getId()),
                enrollmentRepository.countByCourseInstructorIdAndCompletedAtIsNotNullAndDeletedAtIsNull(
                        instructor.getId()
                ),
                paymentRepository.calculateRevenueByInstructor(instructor.getId())
        );
    }

    @Transactional(readOnly = true)
    public List<InstructorCourseResponse> getMyCourses(User instructor) {

        validateInstructor(instructor);

        return courseRepository
                .findByInstructorIdAndDeletedAtIsNullOrderByCreatedAtDesc(instructor.getId())
                .stream()
                .map(InstructorCourseResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InstructorEnrollmentResponse> getMyEnrollments(User instructor) {

        validateInstructor(instructor);

        return enrollmentRepository
                .findByCourseInstructorIdAndDeletedAtIsNullOrderByEnrolledAtDesc(instructor.getId())
                .stream()
                .map(InstructorEnrollmentResponse::new)
                .toList();
    }

    private void validateInstructor(User user) {
        if (user.getRole() != UserRole.INSTRUCTOR && user.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Solo instructores o administradores pueden acceder a este panel");
        }
    }
}
