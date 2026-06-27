package com.novalearn.instructor.lesson.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.lesson.dto.LessonResponse;
import com.novalearn.learning.lesson.service.LessonResourceService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/instructor/lessons")
public class InstructorLessonResourceController {

    private final LessonResourceService resourceService;

    public InstructorLessonResourceController(
            LessonResourceService resourceService
    ) {
        this.resourceService = resourceService;
    }

    @PostMapping(
            value = "/{lessonId}/resource",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<LessonResponse> upload(
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                resourceService.uploadForInstructor(
                        lessonId,
                        file,
                        authenticatedUser
                )
        );
    }

    @DeleteMapping("/{lessonId}/resource")
    public ResponseEntity<LessonResponse> delete(
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                resourceService.deleteForInstructor(
                        lessonId,
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