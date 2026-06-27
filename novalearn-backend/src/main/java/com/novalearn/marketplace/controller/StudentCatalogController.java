package com.novalearn.marketplace.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.category.dto.CourseCategoryResponse;
import com.novalearn.learning.course.enums.CourseType;
import com.novalearn.marketplace.dto.StudentCatalogCourseResponse;
import com.novalearn.marketplace.service.StudentCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/student/catalog")
public class StudentCatalogController {

    private final StudentCatalogService catalogService;

    public StudentCatalogController(
            StudentCatalogService catalogService
    ) {
        this.catalogService = catalogService;
    }

    @GetMapping("/courses")
    public ResponseEntity<List<StudentCatalogCourseResponse>>
    searchCourses(
            @RequestParam(required = false)
            String query,

            @RequestParam(required = false)
            Long categoryId,

            @RequestParam(required = false)
            CourseType courseType,

            @RequestParam(required = false)
            String level,

            @RequestParam(required = false)
            BigDecimal minPrice,

            @RequestParam(required = false)
            BigDecimal maxPrice,

            Authentication authentication
    ) {
        return ResponseEntity.ok(
                catalogService.search(
                        getStudent(authentication),
                        query,
                        categoryId,
                        courseType,
                        level,
                        minPrice,
                        maxPrice
                )
        );
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<StudentCatalogCourseResponse>
    findCourse(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                catalogService.findById(
                        courseId,
                        getStudent(authentication)
                )
        );
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CourseCategoryResponse>>
    findCategories() {
        return ResponseEntity.ok(
                catalogService.findActiveCategories()
        );
    }

    private User getStudent(
            Authentication authentication
    ) {
        return (User) authentication.getPrincipal();
    }
}