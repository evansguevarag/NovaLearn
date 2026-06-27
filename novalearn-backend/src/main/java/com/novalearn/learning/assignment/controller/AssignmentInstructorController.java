package com.novalearn.learning.assignment.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.assignment.dto.*;
import com.novalearn.learning.assignment.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor/assignments")
public class AssignmentInstructorController {

    private final AssignmentService assignmentService;

    public AssignmentInstructorController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping
    public ResponseEntity<AssignmentResponse> create(
            @Valid @RequestBody AssignmentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assignmentService.create(request, user(authentication)));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssignmentResponse>> findByCourse(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(assignmentService.findManagedByCourse(courseId, user(authentication)));
    }

    @GetMapping("/{assignmentId}")
    public ResponseEntity<AssignmentResponse> findById(
            @PathVariable Long assignmentId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(assignmentService.findManagedById(assignmentId, user(authentication)));
    }

    @PutMapping("/{assignmentId}")
    public ResponseEntity<AssignmentResponse> update(
            @PathVariable Long assignmentId,
            @Valid @RequestBody AssignmentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(assignmentService.update(assignmentId, request, user(authentication)));
    }

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long assignmentId,
            Authentication authentication
    ) {
        assignmentService.delete(assignmentId, user(authentication));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmissionResponse>> findSubmissions(
            @PathVariable Long assignmentId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(assignmentService.findSubmissions(assignmentId, user(authentication)));
    }

    @PutMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<AssignmentSubmissionResponse> grade(
            @PathVariable Long submissionId,
            @Valid @RequestBody AssignmentGradeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(assignmentService.grade(submissionId, request, user(authentication)));
    }

    private User user(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}