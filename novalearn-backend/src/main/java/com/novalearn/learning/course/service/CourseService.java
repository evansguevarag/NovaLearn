package com.novalearn.learning.course.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.core.user.repository.UserRepository;
import com.novalearn.learning.category.entity.CourseCategory;
import com.novalearn.learning.category.repository.CourseCategoryRepository;
import com.novalearn.learning.course.dto.CourseRequest;
import com.novalearn.learning.course.dto.CourseResponse;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.enums.CourseStatus;
import com.novalearn.learning.course.enums.CourseType;
import com.novalearn.learning.course.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseCategoryRepository categoryRepository;

    public CourseService(
            CourseRepository courseRepository,
            UserRepository userRepository,
            CourseCategoryRepository categoryRepository
    ) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public CourseResponse create(CourseRequest request) {

        User instructor = userRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new IllegalArgumentException("Instructor no encontrado"));

        if (instructor.getRole() != UserRole.INSTRUCTOR && instructor.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("El usuario indicado no tiene rol de instructor");
        }

        CourseCategory category = categoryRepository.findByIdAndDeletedAtIsNull(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria no encontrada"));

        String title = request.getTitle().trim();
        String slug = generateUniqueSlug(title);

        Course course = new Course();
        course.setInstructor(instructor);
        course.setCategory(category);
        course.setTitle(title);
        course.setSlug(slug);
        course.setShortDescription(request.getShortDescription());
        course.setDescription(request.getDescription());
        course.setRequirements(request.getRequirements());
        course.setTargetAudience(request.getTargetAudience());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setPrice(request.getPrice() != null ? request.getPrice() : BigDecimal.ZERO);
        course.setCourseType(request.getCourseType() != null ? request.getCourseType() : CourseType.FREE);
        course.setStatus(request.getStatus() != null ? request.getStatus() : CourseStatus.DRAFT);
        course.setLevel(request.getLevel());
        course.setCertificateEnabled(request.getCertificateEnabled() != null ? request.getCertificateEnabled() : true);

        if (course.getStatus() == CourseStatus.PUBLISHED) {
            course.setPublishedAt(LocalDateTime.now());
        }

        return new CourseResponse(courseRepository.save(course));
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> findAll() {
        return courseRepository.findByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(CourseResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse findById(Long id) {
        Course course = courseRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        return new CourseResponse(course);
    }

    @Transactional
    public CourseResponse update(Long id, CourseRequest request) {
        Course course = courseRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        User instructor = userRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new IllegalArgumentException("Instructor no encontrado"));

        if (instructor.getRole() != UserRole.INSTRUCTOR && instructor.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("El usuario indicado no tiene rol de instructor");
        }

        CourseCategory category = categoryRepository.findByIdAndDeletedAtIsNull(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria no encontrada"));

        String title = request.getTitle().trim();

        if (!course.getTitle().equalsIgnoreCase(title)) {
            course.setSlug(generateUniqueSlug(title));
        }

        course.setInstructor(instructor);
        course.setCategory(category);
        course.setTitle(title);
        course.setShortDescription(request.getShortDescription());
        course.setDescription(request.getDescription());
        course.setRequirements(request.getRequirements());
        course.setTargetAudience(request.getTargetAudience());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setPrice(request.getPrice() != null ? request.getPrice() : BigDecimal.ZERO);
        course.setCourseType(request.getCourseType() != null ? request.getCourseType() : CourseType.FREE);
        course.setLevel(request.getLevel());

        if (request.getCertificateEnabled() != null) {
            course.setCertificateEnabled(request.getCertificateEnabled());
        }

        if (request.getStatus() != null) {
            course.setStatus(request.getStatus());

            if (request.getStatus() == CourseStatus.PUBLISHED && course.getPublishedAt() == null) {
                course.setPublishedAt(LocalDateTime.now());
            }
        }

        return new CourseResponse(course);
    }

    @Transactional
    public void delete(Long id) {
        Course course = courseRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        course.softDelete();
    }

    private String generateUniqueSlug(String title) {
        String baseSlug = generateSlug(title);
        String slug = baseSlug;
        int counter = 1;

        while (courseRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }

    private String generateSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        return normalized
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}
