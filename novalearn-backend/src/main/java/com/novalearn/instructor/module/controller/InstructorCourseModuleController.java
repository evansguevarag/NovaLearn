package com.novalearn.instructor.module.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.instructor.module.service.InstructorCourseModuleService;
import com.novalearn.learning.module.dto.CourseModuleRequest;
import com.novalearn.learning.module.dto.CourseModuleResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor/course-modules")
public class InstructorCourseModuleController {

    private final InstructorCourseModuleService moduleService;

    public InstructorCourseModuleController(
            InstructorCourseModuleService moduleService
    ) {
        this.moduleService = moduleService;
    }

    @PostMapping
    public ResponseEntity<CourseModuleResponse> create(
            @Valid @RequestBody CourseModuleRequest request,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        CourseModuleResponse response =
                moduleService.create(
                        request,
                        authenticatedUser
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseModuleResponse>> findByCourse(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                moduleService.findByCourse(
                        courseId,
                        authenticatedUser
                )
        );
    }

    @GetMapping("/{moduleId}")
    public ResponseEntity<CourseModuleResponse> findById(
            @PathVariable Long moduleId,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                moduleService.findById(
                        moduleId,
                        authenticatedUser
                )
        );
    }

    @PutMapping("/{moduleId}")
    public ResponseEntity<CourseModuleResponse> update(
            @PathVariable Long moduleId,
            @Valid @RequestBody CourseModuleRequest request,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                moduleService.update(
                        moduleId,
                        request,
                        authenticatedUser
                )
        );
    }

    @DeleteMapping("/{moduleId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long moduleId,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        moduleService.delete(
                moduleId,
                authenticatedUser
        );

        return ResponseEntity.noContent().build();
    }

    private User getAuthenticatedUser(
            Authentication authentication
    ) {
        return (User) authentication.getPrincipal();
    }
}
