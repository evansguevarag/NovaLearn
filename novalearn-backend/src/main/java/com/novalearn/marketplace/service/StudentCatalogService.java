package com.novalearn.marketplace.service;

import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.learning.category.dto.CourseCategoryResponse;
import com.novalearn.learning.category.repository.CourseCategoryRepository;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.enums.CourseStatus;
import com.novalearn.learning.course.enums.CourseType;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.marketplace.dto.StudentCatalogCourseResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StudentCatalogService {

    private final CourseRepository courseRepository;
    private final CourseCategoryRepository categoryRepository;
    private final EnrollmentRepository enrollmentRepository;

    public StudentCatalogService(
            CourseRepository courseRepository,
            CourseCategoryRepository categoryRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional(readOnly = true)
    public List<StudentCatalogCourseResponse> search(
            User student,
            String query,
            Long categoryId,
            CourseType courseType,
            String level,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        validateStudent(student);
        validatePriceRange(minPrice, maxPrice);

        String normalizedQuery = normalizeText(query);
        String normalizedLevel = normalizeText(level);

        return courseRepository
                .searchPublishedCourses(
                        normalizedQuery,
                        categoryId,
                        courseType,
                        normalizedLevel,
                        minPrice,
                        maxPrice
                )
                .stream()
                .map(course -> toResponse(course, student))
                .toList();
    }

    @Transactional(readOnly = true)
    public StudentCatalogCourseResponse findById(
            Long courseId,
            User student
    ) {
        validateStudent(student);

        Course course = courseRepository
                .findByIdAndDeletedAtIsNull(courseId)
                .filter(item ->
                        item.getStatus() == CourseStatus.PUBLISHED
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Curso publicado no encontrado"
                        )
                );

        return toResponse(course, student);
    }

    @Transactional(readOnly = true)
    public List<CourseCategoryResponse> findActiveCategories() {
        return categoryRepository
                .findByActiveTrueAndDeletedAtIsNullOrderByNameAsc()
                .stream()
                .map(CourseCategoryResponse::new)
                .toList();
    }

    private StudentCatalogCourseResponse toResponse(
            Course course,
            User student
    ) {
        boolean enrolled =
                enrollmentRepository
                        .existsByStudentIdAndCourseIdAndDeletedAtIsNull(
                                student.getId(),
                                course.getId()
                        );

        return new StudentCatalogCourseResponse(
                course,
                enrolled
        );
    }

    private void validateStudent(User student) {
        if (
                student == null ||
                student.getRole() != UserRole.STUDENT
        ) {
            throw new IllegalArgumentException(
                    "Solo los estudiantes pueden consultar este catálogo"
            );
        }
    }

    private void validatePriceRange(
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        if (
                minPrice != null &&
                minPrice.compareTo(BigDecimal.ZERO) < 0
        ) {
            throw new IllegalArgumentException(
                    "El precio mínimo no puede ser negativo"
            );
        }

        if (
                maxPrice != null &&
                maxPrice.compareTo(BigDecimal.ZERO) < 0
        ) {
            throw new IllegalArgumentException(
                    "El precio máximo no puede ser negativo"
            );
        }

        if (
                minPrice != null &&
                maxPrice != null &&
                minPrice.compareTo(maxPrice) > 0
        ) {
            throw new IllegalArgumentException(
                    "El precio mínimo no puede superar al precio máximo"
            );
        }
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}