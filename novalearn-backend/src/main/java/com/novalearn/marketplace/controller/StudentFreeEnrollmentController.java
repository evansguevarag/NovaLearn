package com.novalearn.marketplace.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.enrollment.dto.EnrollmentResponse;
import com.novalearn.marketplace.service.StudentFreeEnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student/catalog/courses")
public class StudentFreeEnrollmentController {

    private final StudentFreeEnrollmentService enrollmentService;

    public StudentFreeEnrollmentController(
            StudentFreeEnrollmentService enrollmentService
    ) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<EnrollmentResponse> enroll(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        User student =
                (User) authentication.getPrincipal();

        EnrollmentResponse response =
                enrollmentService.enroll(
                        courseId,
                        student
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}