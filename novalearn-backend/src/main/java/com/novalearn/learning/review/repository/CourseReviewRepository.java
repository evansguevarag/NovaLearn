package com.novalearn.learning.review.repository;

import com.novalearn.learning.review.entity.CourseReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {

    boolean existsByStudentIdAndCourseIdAndDeletedAtIsNull(Long studentId, Long courseId);

    Optional<CourseReview> findByIdAndDeletedAtIsNull(Long id);

    Optional<CourseReview> findByStudentIdAndCourseIdAndDeletedAtIsNull(Long studentId, Long courseId);

    List<CourseReview> findByCourseIdAndDeletedAtIsNullAndActiveTrueOrderByCreatedAtDesc(Long courseId);

    List<CourseReview> findByCourseIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long courseId);
}