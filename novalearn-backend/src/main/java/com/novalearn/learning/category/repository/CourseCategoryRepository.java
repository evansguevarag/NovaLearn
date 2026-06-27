package com.novalearn.learning.category.repository;

import com.novalearn.learning.category.entity.CourseCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseCategoryRepository
        extends JpaRepository<CourseCategory, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlug(String slug);

    Optional<CourseCategory> findByIdAndDeletedAtIsNull(
            Long id
    );

    List<CourseCategory>
    findByDeletedAtIsNullOrderByNameAsc();

    List<CourseCategory>
    findByActiveTrueAndDeletedAtIsNullOrderByNameAsc();
}
