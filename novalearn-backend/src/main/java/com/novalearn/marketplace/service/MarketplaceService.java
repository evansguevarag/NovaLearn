package com.novalearn.marketplace.service;

import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.enums.CourseStatus;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.marketplace.dto.PublicCourseDetailResponse;
import com.novalearn.marketplace.dto.PublicCourseResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.novalearn.marketplace.dto.CourseSearchRequest;

import java.util.List;

@Service
public class MarketplaceService {

    private final CourseRepository courseRepository;

    public MarketplaceService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Transactional(readOnly = true)
    public List<PublicCourseResponse> findPublishedCourses() {
        return courseRepository
                .findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc(CourseStatus.PUBLISHED)
                .stream()
                .map(PublicCourseResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicCourseResponse> findByCategory(Long categoryId) {
        return courseRepository
                .findByCategoryIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
                        categoryId,
                        CourseStatus.PUBLISHED
                )
                .stream()
                .map(PublicCourseResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicCourseResponse> search(String query) {
        return courseRepository
                .findByTitleContainingIgnoreCaseAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
                        query,
                        CourseStatus.PUBLISHED
                )
                .stream()
                .map(PublicCourseResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public PublicCourseDetailResponse findBySlug(String slug) {
        Course course = courseRepository
                .findBySlugAndStatusAndDeletedAtIsNull(slug, CourseStatus.PUBLISHED)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        return new PublicCourseDetailResponse(course);
    }

    @Transactional(readOnly = true)
    public List<PublicCourseResponse> advancedSearch(CourseSearchRequest request) {
        return courseRepository
                .searchPublishedCourses(
                        request.getQuery(),
                        request.getCategoryId(),
                        request.getCourseType(),
                        request.getLevel(),
                        request.getMinPrice(),
                        request.getMaxPrice()
                )
                .stream()
                .map(PublicCourseResponse::new)
                .toList();
    }
}