package com.novalearn.marketplace.service;

import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.config.culqi.CulqiProperties;
import com.novalearn.core.setting.entity.SystemSetting;
import com.novalearn.core.setting.repository.SystemSettingRepository;
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
import java.math.RoundingMode;
import java.util.List;

@Service
public class StudentCatalogService {

    private final CourseRepository courseRepository;
    private final CourseCategoryRepository categoryRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final CulqiProperties culqiProperties;
    private static final BigDecimal DEFAULT_PROCESSING_FEE_PERCENTAGE =
            BigDecimal.valueOf(4.02);

    public StudentCatalogService(
            CourseRepository courseRepository,
            CourseCategoryRepository categoryRepository,
            EnrollmentRepository enrollmentRepository,
            SystemSettingRepository systemSettingRepository,
            CulqiProperties culqiProperties
    ) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.culqiProperties = culqiProperties;
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
                enrolled,
                calculatePublicPrice(course)
        );
    }

    private BigDecimal calculatePublicPrice(Course course) {
        BigDecimal basePrice = normalizeMoney(course.getPrice());

        if (course.getCourseType() == CourseType.FREE) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        PaymentSettings settings = getEffectivePaymentSettings();

        if (!settings.passProcessingFeeToStudent()) {
            return basePrice;
        }

        BigDecimal processingFee = normalizeMoney(
                basePrice.multiply(settings.processingFeePercentage())
                        .divide(
                                BigDecimal.valueOf(100),
                                6,
                                RoundingMode.HALF_UP
                        )
        );

        return normalizeMoney(basePrice.add(processingFee));
    }

    private PaymentSettings getEffectivePaymentSettings() {
        return systemSettingRepository
                .findFirstByOrderByIdAsc()
                .map(this::toPaymentSettings)
                .orElseGet(() -> new PaymentSettings(
                        resolveDefaultProcessingFeePercentage(),
                        culqiProperties.isPassProcessingFeeToStudent()
                ));
    }

    private PaymentSettings toPaymentSettings(SystemSetting setting) {
        return new PaymentSettings(
                normalizeMoney(
                        setting.getPaymentProcessingFeePercentage()
                ),
                setting.isPassProcessingFeeToStudent()
        );
    }

    private BigDecimal resolveDefaultProcessingFeePercentage() {
        BigDecimal configuredPercentage =
                normalizeMoney(
                        culqiProperties.getProcessingFeePercentage()
                );

        if (configuredPercentage.compareTo(BigDecimal.ZERO) > 0) {
            return configuredPercentage;
        }

        return DEFAULT_PROCESSING_FEE_PERCENTAGE.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }

    private BigDecimal normalizeMoney(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        return value.setScale(2, RoundingMode.HALF_UP);
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

    private record PaymentSettings(
            BigDecimal processingFeePercentage,
            boolean passProcessingFeeToStudent
    ) {
    }
}
