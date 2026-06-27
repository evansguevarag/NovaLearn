package com.novalearn.instructor.course.service;

import com.novalearn.common.exception.BadRequestException;
import com.novalearn.common.exception.ForbiddenActionException;
import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.instructor.course.dto.InstructorCourseRequest;
import com.novalearn.instructor.security.service.InstructorContentAccessService;
import com.novalearn.learning.category.entity.CourseCategory;
import com.novalearn.learning.category.repository.CourseCategoryRepository;
import com.novalearn.learning.course.dto.CourseResponse;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.enums.CourseStatus;
import com.novalearn.learning.course.enums.CourseType;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.learning.course.service.CourseSlugService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class InstructorCourseService {

    private final CourseRepository courseRepository;
    private final CourseCategoryRepository categoryRepository;
    private final CourseSlugService slugService;
    private final InstructorContentAccessService accessService;

    public InstructorCourseService(
            CourseRepository courseRepository,
            CourseCategoryRepository categoryRepository,
            CourseSlugService slugService,
            InstructorContentAccessService accessService
    ) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.slugService = slugService;
        this.accessService = accessService;
    }

    @Transactional
    public CourseResponse create(
            InstructorCourseRequest request,
            User authenticatedUser
    ) {
        validateInstructor(authenticatedUser);

        CourseCategory category = findActiveCategory(
                request.getCategoryId()
        );

        String title = request.getTitle().trim();

        Course course = new Course();
        course.setInstructor(authenticatedUser);
        course.setCategory(category);
        course.setTitle(title);
        course.setSlug(
                slugService.generateUniqueSlug(title)
        );
        course.setShortDescription(
                normalizeNullableText(
                        request.getShortDescription()
                )
        );
        course.setDescription(
                normalizeNullableText(
                        request.getDescription()
                )
        );
        course.setRequirements(
                normalizeNullableText(
                        request.getRequirements()
                )
        );
        course.setTargetAudience(
                normalizeNullableText(
                        request.getTargetAudience()
                )
        );
        course.setThumbnailUrl(null);
        course.setCourseType(
                resolveCourseType(request.getCourseType())
        );
        course.setPrice(
                resolvePrice(
                        request.getPrice(),
                        course.getCourseType()
                )
        );
        course.setStatus(CourseStatus.DRAFT);
        course.setLevel(
                normalizeNullableText(request.getLevel())
        );
        course.setCertificateEnabled(
                request.getCertificateEnabled() == null
                        || request.getCertificateEnabled()
        );

        Course savedCourse =
                courseRepository.save(course);

        return new CourseResponse(savedCourse);
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> findMyCourses(
            User authenticatedUser
    ) {
        validateInstructorOrAdmin(authenticatedUser);

        if (authenticatedUser.getRole() == UserRole.ADMIN) {
            return courseRepository
                    .findByDeletedAtIsNullOrderByCreatedAtDesc()
                    .stream()
                    .map(CourseResponse::new)
                    .toList();
        }

        return courseRepository
                .findByInstructorIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        authenticatedUser.getId()
                )
                .stream()
                .map(CourseResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse findById(
            Long courseId,
            User authenticatedUser
    ) {
        Course course = accessService.getAccessibleCourse(
                courseId,
                authenticatedUser
        );

        return new CourseResponse(course);
    }

    @Transactional
    public CourseResponse update(
            Long courseId,
            InstructorCourseRequest request,
            User authenticatedUser
    ) {
        Course course = accessService.getAccessibleCourse(
                courseId,
                authenticatedUser
        );

        validateEditableCourse(
                course,
                authenticatedUser
        );

        CourseCategory category = findActiveCategory(
                request.getCategoryId()
        );

        String title = request.getTitle().trim();

        if (!course.getTitle().equalsIgnoreCase(title)) {
            course.setSlug(
                    slugService.generateUniqueSlug(title)
            );
        }

        course.setCategory(category);
        course.setTitle(title);
        course.setShortDescription(
                normalizeNullableText(
                        request.getShortDescription()
                )
        );
        course.setDescription(
                normalizeNullableText(
                        request.getDescription()
                )
        );
        course.setRequirements(
                normalizeNullableText(
                        request.getRequirements()
                )
        );
        course.setTargetAudience(
                normalizeNullableText(
                        request.getTargetAudience()
                )
        );

        CourseType courseType =
                resolveCourseType(request.getCourseType());

        course.setCourseType(courseType);
        course.setPrice(
                resolvePrice(
                        request.getPrice(),
                        courseType
                )
        );
        course.setLevel(
                normalizeNullableText(request.getLevel())
        );

        if (request.getCertificateEnabled() != null) {
            course.setCertificateEnabled(
                    request.getCertificateEnabled()
            );
        }

        Course updatedCourse =
                courseRepository.save(course);

        return new CourseResponse(updatedCourse);
    }

    private CourseCategory findActiveCategory(
            Long categoryId
    ) {
        CourseCategory category = categoryRepository
                .findByIdAndDeletedAtIsNull(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Categoria no encontrada"
                        )
                );

        if (!Boolean.TRUE.equals(category.getActive())) {
            throw new BadRequestException(
                    "La categoria seleccionada se encuentra inactiva"
            );
        }

        return category;
    }

    private void validateEditableCourse(
            Course course,
            User authenticatedUser
    ) {
        if (authenticatedUser.getRole() == UserRole.ADMIN) {
            return;
        }

        if (course.getStatus() == CourseStatus.ARCHIVED) {
            throw new ForbiddenActionException(
                    "Un instructor no puede editar un curso archivado"
            );
        }
    }

    private void validateInstructor(
            User authenticatedUser
    ) {
        if (
                authenticatedUser == null ||
                authenticatedUser.getRole()
                        != UserRole.INSTRUCTOR
        ) {
            throw new ForbiddenActionException(
                    "Solo un instructor puede crear cursos desde este recurso"
            );
        }
    }

    private void validateInstructorOrAdmin(
            User authenticatedUser
    ) {
        if (authenticatedUser == null) {
            throw new ForbiddenActionException(
                    "No se pudo identificar al usuario autenticado"
            );
        }

        UserRole role = authenticatedUser.getRole();

        if (
                role != UserRole.INSTRUCTOR &&
                role != UserRole.ADMIN
        ) {
            throw new ForbiddenActionException(
                    "No tienes permiso para administrar cursos"
            );
        }
    }

    private CourseType resolveCourseType(
            CourseType courseType
    ) {
        return courseType != null
                ? courseType
                : CourseType.FREE;
    }

    private BigDecimal resolvePrice(
            BigDecimal price,
            CourseType courseType
    ) {
        if (courseType == CourseType.FREE) {
            return BigDecimal.ZERO;
        }

        if (
                price == null ||
                price.compareTo(BigDecimal.ZERO) <= 0
        ) {
            throw new BadRequestException(
                    "Un curso de pago debe tener un precio mayor que cero"
            );
        }

        return price;
    }

    private String normalizeNullableText(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();

        return normalizedValue.isEmpty()
                ? null
                : normalizedValue;
    }
}
