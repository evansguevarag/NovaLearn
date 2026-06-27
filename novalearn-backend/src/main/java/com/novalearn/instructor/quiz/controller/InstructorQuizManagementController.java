package com.novalearn.instructor.quiz.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.quiz.dto.QuizDetailResponse;
import com.novalearn.learning.quiz.dto.QuizQuestionRequest;
import com.novalearn.learning.quiz.dto.QuizQuestionResponse;
import com.novalearn.learning.quiz.dto.QuizSettingRequest;
import com.novalearn.learning.quiz.dto.QuizSettingResponse;
import com.novalearn.learning.quiz.service.QuizManagementService;
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

@RestController
@RequestMapping(
        "/api/v1/instructor/quiz/lessons"
)
public class InstructorQuizManagementController {

    private final QuizManagementService quizService;

    public InstructorQuizManagementController(
            QuizManagementService quizService
    ) {
        this.quizService = quizService;
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<QuizDetailResponse> findByLesson(
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(
                        authentication
                );

        return ResponseEntity.ok(
                quizService.findByLessonId(
                        lessonId,
                        authenticatedUser
                )
        );
    }

    @PutMapping("/{lessonId}/settings")
    public ResponseEntity<QuizSettingResponse> saveSettings(
            @PathVariable Long lessonId,
            @Valid
            @RequestBody
            QuizSettingRequest request,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(
                        authentication
                );

        return ResponseEntity.ok(
                quizService.saveSettings(
                        lessonId,
                        request,
                        authenticatedUser
                )
        );
    }

    @PostMapping("/{lessonId}/questions")
    public ResponseEntity<QuizQuestionResponse> createQuestion(
            @PathVariable Long lessonId,
            @Valid
            @RequestBody
            QuizQuestionRequest request,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(
                        authentication
                );

        QuizQuestionResponse response =
                quizService.createQuestion(
                        lessonId,
                        request,
                        authenticatedUser
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping(
            "/{lessonId}/questions/{questionId}"
    )
    public ResponseEntity<QuizQuestionResponse> updateQuestion(
            @PathVariable Long lessonId,
            @PathVariable Long questionId,
            @Valid
            @RequestBody
            QuizQuestionRequest request,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(
                        authentication
                );

        return ResponseEntity.ok(
                quizService.updateQuestion(
                        lessonId,
                        questionId,
                        request,
                        authenticatedUser
                )
        );
    }

    @DeleteMapping(
            "/{lessonId}/questions/{questionId}"
    )
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long lessonId,
            @PathVariable Long questionId,
            Authentication authentication
    ) {
        User authenticatedUser =
                getAuthenticatedUser(
                        authentication
                );

        quizService.deleteQuestion(
                lessonId,
                questionId,
                authenticatedUser
        );

        return ResponseEntity
                .noContent()
                .build();
    }

    private User getAuthenticatedUser(
            Authentication authentication
    ) {
        return (User) authentication
                .getPrincipal();
    }
}