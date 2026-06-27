package com.novalearn.learning.assignment.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.assignment.dto.*;
import com.novalearn.learning.assignment.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/assignments")
public class AssignmentStudentController {

    private final AssignmentService assignmentService;

    public AssignmentStudentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssignmentResponse>> findByCourse(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(assignmentService.findPublishedForStudent(courseId, user(authentication)));
    }

    @GetMapping("/{assignmentId}")
    public ResponseEntity<AssignmentResponse> findById(
            @PathVariable Long assignmentId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(assignmentService.findPublishedForStudentById(assignmentId, user(authentication)));
    }

    @PutMapping("/{assignmentId}/submission")
    public ResponseEntity<AssignmentSubmissionResponse> saveSubmission(
            @PathVariable Long assignmentId,
            @Valid @RequestBody AssignmentSubmissionRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(assignmentService.saveStudentSubmission(assignmentId, request, user(authentication)));
    }

    @GetMapping("/{assignmentId}/submission")
    public ResponseEntity<AssignmentSubmissionResponse> findMySubmission(
            @PathVariable Long assignmentId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(assignmentService.findMySubmission(assignmentId, user(authentication)));
    }

    private User user(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}