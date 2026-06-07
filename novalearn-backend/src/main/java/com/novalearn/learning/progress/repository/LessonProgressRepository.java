package com.novalearn.learning.progress.repository;

import com.novalearn.learning.progress.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByEnrollmentIdAndLessonId(Long enrollmentId, Long lessonId);

    List<LessonProgress> findByEnrollmentIdOrderByLessonSortOrderAsc(Long enrollmentId);

    long countByEnrollmentIdAndCompletedTrue(Long enrollmentId);
}