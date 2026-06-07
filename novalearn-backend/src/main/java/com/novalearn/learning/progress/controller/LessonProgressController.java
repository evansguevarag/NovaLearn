package com.novalearn.learning.progress.controller;

import com.novalearn.learning.progress.dto.LessonProgressRequest;
import com.novalearn.learning.progress.dto.LessonProgressResponse;
import com.novalearn.learning.progress.service.LessonProgressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/progress")
public class LessonProgressController {

    private final LessonProgressService progressService;

    public LessonProgressController(LessonProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping
    public ResponseEntity<LessonProgressResponse> updateProgress(
            @Valid @RequestBody LessonProgressRequest request
    ) {
        return ResponseEntity.ok(progressService.updateProgress(request));
    }

    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<List<LessonProgressResponse>> findByEnrollment(
            @PathVariable Long enrollmentId
    ) {
        return ResponseEntity.ok(progressService.findByEnrollment(enrollmentId));
    }
}