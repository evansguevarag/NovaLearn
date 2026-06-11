package com.novalearn.learning.review.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.review.dto.CourseReviewRequest;
import com.novalearn.learning.review.dto.CourseReviewResponse;
import com.novalearn.learning.review.service.CourseReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CourseReviewController {

    private final CourseReviewService reviewService;

    public CourseReviewController(CourseReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/student/reviews")
    public ResponseEntity<CourseReviewResponse> createOrUpdate(
            Authentication authentication,
            @Valid @RequestBody CourseReviewRequest request
    ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                reviewService.createOrUpdate(student, request)
        );
    }

    @GetMapping("/public/reviews/course/{courseId}")
    public ResponseEntity<List<CourseReviewResponse>> findPublicByCourse(
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(
                reviewService.findPublicByCourse(courseId)
        );
    }

    @GetMapping("/admin/reviews/course/{courseId}")
    public ResponseEntity<List<CourseReviewResponse>> findAdminByCourse(
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(
                reviewService.findAdminByCourse(courseId)
        );
    }

    @DeleteMapping("/admin/reviews/{reviewId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long reviewId
    ) {
        reviewService.delete(reviewId);
        return ResponseEntity.noContent().build();
    }
}