package com.novalearn.instructor.course.controller;

import com.novalearn.learning.category.dto.CourseCategoryResponse;
import com.novalearn.learning.category.repository.CourseCategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor/course-categories")
public class InstructorCourseCategoryController {

    private final CourseCategoryRepository categoryRepository;

    public InstructorCourseCategoryController(
            CourseCategoryRepository categoryRepository
    ) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<CourseCategoryResponse>>
    findActiveCategories() {

        List<CourseCategoryResponse> categories =
                categoryRepository
                        .findByActiveTrueAndDeletedAtIsNullOrderByNameAsc()
                        .stream()
                        .map(CourseCategoryResponse::new)
                        .toList();

        return ResponseEntity.ok(categories);
    }
}
