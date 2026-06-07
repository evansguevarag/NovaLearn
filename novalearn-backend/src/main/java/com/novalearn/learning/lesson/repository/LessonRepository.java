package com.novalearn.learning.lesson.repository;

import com.novalearn.learning.lesson.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    Optional<Lesson> findByIdAndDeletedAtIsNull(Long id);

    List<Lesson> findByModuleIdAndDeletedAtIsNullOrderBySortOrderAsc(Long moduleId);

    long countByModuleCourseIdAndDeletedAtIsNull(Long courseId);
}