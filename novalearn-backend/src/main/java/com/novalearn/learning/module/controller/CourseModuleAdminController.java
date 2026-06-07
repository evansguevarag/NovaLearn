package com.novalearn.learning.module.controller;

import com.novalearn.learning.module.dto.CourseModuleRequest;
import com.novalearn.learning.module.dto.CourseModuleResponse;
import com.novalearn.learning.module.service.CourseModuleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/course-modules")
public class CourseModuleAdminController {

    private final CourseModuleService moduleService;

    public CourseModuleAdminController(CourseModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @PostMapping
    public ResponseEntity<CourseModuleResponse> create(
            @Valid @RequestBody CourseModuleRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(moduleService.create(request));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseModuleResponse>> findByCourse(
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(moduleService.findByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseModuleResponse> findById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(moduleService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseModuleResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CourseModuleRequest request
    ) {
        return ResponseEntity.ok(moduleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        moduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
