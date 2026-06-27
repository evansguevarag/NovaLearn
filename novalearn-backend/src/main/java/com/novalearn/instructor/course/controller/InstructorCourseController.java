package com.novalearn.instructor.course.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.instructor.course.dto.InstructorCourseRequest;
import com.novalearn.instructor.course.service.InstructorCourseService;
import com.novalearn.learning.course.dto.CourseResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor/courses")
public class InstructorCourseController {

    private final InstructorCourseService courseService;

    public InstructorCourseController(
            InstructorCourseService courseService
    ) {
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<CourseResponse> create(
            @Valid @RequestBody InstructorCourseRequest request,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        CourseResponse response = courseService.create(
                request,
                authenticatedUser
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> findMyCourses(
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                courseService.findMyCourses(
                        authenticatedUser
                )
        );
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseResponse> findById(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                courseService.findById(
                        courseId,
                        authenticatedUser
                )
        );
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<CourseResponse> update(
            @PathVariable Long courseId,
            @Valid @RequestBody InstructorCourseRequest request,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                courseService.update(
                        courseId,
                        request,
                        authenticatedUser
                )
        );
    }

    private User getAuthenticatedUser(
            Authentication authentication
    ) {
        return (User) authentication.getPrincipal();
    }
}
