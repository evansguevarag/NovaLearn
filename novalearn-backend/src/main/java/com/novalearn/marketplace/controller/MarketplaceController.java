package com.novalearn.marketplace.controller;

import com.novalearn.marketplace.dto.PublicCourseDetailResponse;
import com.novalearn.marketplace.dto.PublicCourseResponse;
import com.novalearn.marketplace.service.MarketplaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.novalearn.marketplace.dto.CourseSearchRequest;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/marketplace")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    public MarketplaceController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
    }

    @GetMapping("/courses")
    public ResponseEntity<List<PublicCourseResponse>> findPublishedCourses() {
        return ResponseEntity.ok(marketplaceService.findPublishedCourses());
    }

    @GetMapping("/courses/category/{categoryId}")
    public ResponseEntity<List<PublicCourseResponse>> findByCategory(
            @PathVariable Long categoryId
    ) {
        return ResponseEntity.ok(marketplaceService.findByCategory(categoryId));
    }

    @GetMapping("/courses/search")
    public ResponseEntity<List<PublicCourseResponse>> search(
            @RequestParam String query
    ) {
        return ResponseEntity.ok(marketplaceService.search(query));
    }

    @GetMapping("/courses/{slug}")
    public ResponseEntity<PublicCourseDetailResponse> findBySlug(
            @PathVariable String slug
    ) {
        return ResponseEntity.ok(marketplaceService.findBySlug(slug));
    }

    @PostMapping("/courses/advanced-search")
    public ResponseEntity<List<PublicCourseResponse>> advancedSearch(
            @RequestBody CourseSearchRequest request
    ) {
        return ResponseEntity.ok(
                marketplaceService.advancedSearch(request)
        );
    }
}
