package com.novalearn.learning.module.repository;

import com.novalearn.learning.module.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {

    Optional<CourseModule> findByIdAndDeletedAtIsNull(Long id);

    List<CourseModule> findByCourseIdAndDeletedAtIsNullOrderBySortOrderAsc(Long courseId);
}