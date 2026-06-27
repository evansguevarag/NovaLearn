package com.novalearn.instructor.lesson.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.instructor.lesson.service.InstructorLessonService;
import com.novalearn.learning.lesson.dto.LessonRequest;
import com.novalearn.learning.lesson.dto.LessonResponse;
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
@RequestMapping("/api/v1/instructor/lessons")
public class InstructorLessonController {

    private final InstructorLessonService lessonService;

    public InstructorLessonController(
            InstructorLessonService lessonService
    ) {
        this.lessonService = lessonService;
    }

    @PostMapping
    public ResponseEntity<LessonResponse> create(
            @Valid @RequestBody LessonRequest request,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        LessonResponse response = lessonService.create(
                request,
                authenticatedUser
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<LessonResponse>> findByModule(
            @PathVariable Long moduleId,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                lessonService.findByModule(
                        moduleId,
                        authenticatedUser
                )
        );
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<LessonResponse> findById(
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                lessonService.findById(
                        lessonId,
                        authenticatedUser
                )
        );
    }

    @PutMapping("/{lessonId}")
    public ResponseEntity<LessonResponse> update(
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonRequest request,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                lessonService.update(
                        lessonId,
                        request,
                        authenticatedUser
                )
        );
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        lessonService.delete(
                lessonId,
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
