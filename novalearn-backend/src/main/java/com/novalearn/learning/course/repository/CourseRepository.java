package com.novalearn.learning.course.repository;

import com.novalearn.learning.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    boolean existsBySlug(String slug);

    Optional<Course> findByIdAndDeletedAtIsNull(Long id);

    List<Course> findByDeletedAtIsNullOrderByCreatedAtDesc();
}