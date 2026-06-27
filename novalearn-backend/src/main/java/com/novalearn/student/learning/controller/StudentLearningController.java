package com.novalearn.student.learning.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.student.learning.dto.StudentLearningCourseResponse;
import com.novalearn.student.learning.service.StudentLearningService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student/learning")
public class StudentLearningController {

    private final StudentLearningService learningService;

    public StudentLearningController(
            StudentLearningService learningService
    ) {
        this.learningService = learningService;
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<StudentLearningCourseResponse>
    findCourseClassroom(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        User student =
                (User) authentication.getPrincipal();

        StudentLearningCourseResponse response =
                learningService.findCourseClassroom(
                        courseId,
                        student
                );

        return ResponseEntity.ok(response);
    }
}