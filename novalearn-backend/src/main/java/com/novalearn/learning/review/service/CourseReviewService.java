package com.novalearn.learning.review.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.learning.review.dto.CourseReviewRequest;
import com.novalearn.learning.review.dto.CourseReviewResponse;
import com.novalearn.learning.review.entity.CourseReview;
import com.novalearn.learning.review.repository.CourseReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseReviewService {

    private final CourseReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseReviewService(
            CourseReviewRepository reviewRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional
    public CourseReviewResponse createOrUpdate(User student, CourseReviewRequest request) {

        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("Solo los estudiantes pueden dejar reseñas");
        }

        Course course = courseRepository.findByIdAndDeletedAtIsNull(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        if (!enrollmentRepository.existsByStudentIdAndCourseIdAndDeletedAtIsNull(
                student.getId(),
                course.getId()
        )) {
            throw new IllegalArgumentException("Solo puedes reseñar cursos en los que estas matriculado");
        }

        CourseReview review = reviewRepository
                .findByStudentIdAndCourseIdAndDeletedAtIsNull(student.getId(), course.getId())
                .orElseGet(() -> {
                    CourseReview newReview = new CourseReview();
                    newReview.setStudent(student);
                    newReview.setCourse(course);
                    return newReview;
                });

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        return new CourseReviewResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<CourseReviewResponse> findPublicByCourse(Long courseId) {
        return reviewRepository
                .findByCourseIdAndDeletedAtIsNullAndActiveTrueOrderByCreatedAtDesc(courseId)
                .stream()
                .map(CourseReviewResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseReviewResponse> findAdminByCourse(Long courseId) {
        return reviewRepository
                .findByCourseIdAndDeletedAtIsNullOrderByCreatedAtDesc(courseId)
                .stream()
                .map(CourseReviewResponse::new)
                .toList();
    }

    @Transactional
    public void delete(Long reviewId) {
        CourseReview review = reviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Reseña no encontrada"));

        review.softDelete();
    }
}