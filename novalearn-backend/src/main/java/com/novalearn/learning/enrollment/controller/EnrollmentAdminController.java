package com.novalearn.learning.enrollment.controller;

import com.novalearn.learning.enrollment.dto.EnrollmentRequest;
import com.novalearn.learning.enrollment.dto.EnrollmentResponse;
import com.novalearn.learning.enrollment.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/enrollments")
public class EnrollmentAdminController {

    private final EnrollmentService enrollmentService;

    public EnrollmentAdminController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public ResponseEntity<EnrollmentResponse> create(
            @Valid @RequestBody EnrollmentRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(enrollmentService.create(request));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EnrollmentResponse>> findByStudent(
            @PathVariable Long studentId
    ) {
        return ResponseEntity.ok(enrollmentService.findByStudent(studentId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EnrollmentResponse>> findByCourse(
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(enrollmentService.findByCourse(courseId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        enrollmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}