package com.novalearn.learning.course.repository;

import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.enums.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    boolean existsBySlug(String slug);

    Optional<Course> findByIdAndDeletedAtIsNull(Long id);

    Optional<Course> findBySlugAndStatusAndDeletedAtIsNull(
            String slug,
            CourseStatus status
    );

    List<Course> findByDeletedAtIsNullOrderByCreatedAtDesc();

    List<Course> findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            CourseStatus status
    );

    List<Course> findByCategoryIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            Long categoryId,
            CourseStatus status
    );

    List<Course> findByTitleContainingIgnoreCaseAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            String title,
            CourseStatus status
    );
}