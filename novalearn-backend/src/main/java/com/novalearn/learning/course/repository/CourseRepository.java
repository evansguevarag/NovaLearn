package com.novalearn.learning.course.repository;

import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.enums.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import com.novalearn.learning.course.enums.CourseType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

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

        @Query("""
                SELECT c
                FROM Course c
                WHERE c.deletedAt IS NULL
                AND c.status = com.novalearn.learning.course.enums.CourseStatus.PUBLISHED
                AND (
                        :query IS NULL OR :query = '' OR
                        LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR
                        LOWER(c.shortDescription) LIKE LOWER(CONCAT('%', :query, '%'))
                )
                AND (:categoryId IS NULL OR c.category.id = :categoryId)
                AND (:courseType IS NULL OR c.courseType = :courseType)
                AND (:level IS NULL OR :level = '' OR LOWER(c.level) = LOWER(:level))
                AND (:minPrice IS NULL OR c.price >= :minPrice)
                AND (:maxPrice IS NULL OR c.price <= :maxPrice)
                ORDER BY c.createdAt DESC
                """)
        List<Course> searchPublishedCourses(
                @Param("query") String query,
                @Param("categoryId") Long categoryId,
                @Param("courseType") CourseType courseType,
                @Param("level") String level,
                @Param("minPrice") BigDecimal minPrice,
                @Param("maxPrice") BigDecimal maxPrice
        );

        long countByDeletedAtIsNull();

        long countByStatusAndDeletedAtIsNull(CourseStatus status);
}