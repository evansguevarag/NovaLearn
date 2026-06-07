package com.novalearn.learning.lesson.controller;

import com.novalearn.learning.lesson.dto.LessonRequest;
import com.novalearn.learning.lesson.dto.LessonResponse;
import com.novalearn.learning.lesson.service.LessonService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/lessons")
public class LessonAdminController {

    private final LessonService lessonService;

    public LessonAdminController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @PostMapping
    public ResponseEntity<LessonResponse> create(
            @Valid @RequestBody LessonRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(lessonService.create(request));
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<LessonResponse>> findByModule(
            @PathVariable Long moduleId
    ) {
        return ResponseEntity.ok(lessonService.findByModule(moduleId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonResponse> findById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(lessonService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LessonResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody LessonRequest request
    ) {
        return ResponseEntity.ok(lessonService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        lessonService.delete(id);
        return ResponseEntity.noContent().build();
    }
}