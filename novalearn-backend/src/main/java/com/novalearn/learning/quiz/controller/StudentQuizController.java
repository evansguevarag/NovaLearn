package com.novalearn.learning.quiz.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.quiz.dto.QuizAttemptResponse;
import com.novalearn.learning.quiz.dto.QuizResultResponse;
import com.novalearn.learning.quiz.dto.QuizSubmissionRequest;
import com.novalearn.learning.quiz.dto.StudentQuizResponse;
import com.novalearn.learning.quiz.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(
        "/api/v1/student/quiz"
)
public class StudentQuizController {

    private final QuizService quizService;

    public StudentQuizController(
            QuizService quizService
    ) {
        this.quizService = quizService;
    }

    @PostMapping(
            "/lessons/{lessonId}/attempts/start"
    )
    public ResponseEntity<StudentQuizResponse> startAttempt(
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        User authenticatedStudent =
                getAuthenticatedUser(
                        authentication
                );

        return ResponseEntity.ok(
                quizService.startAttempt(
                        authenticatedStudent,
                        lessonId
                )
        );
    }

    @PostMapping(
            "/lessons/{lessonId}/attempts/submit"
    )
    public ResponseEntity<QuizResultResponse> submitAttempt(
            @PathVariable Long lessonId,
            @Valid
            @RequestBody
            QuizSubmissionRequest request,
            Authentication authentication
    ) {
        User authenticatedStudent =
                getAuthenticatedUser(
                        authentication
                );

        return ResponseEntity.ok(
                quizService.submitAttempt(
                        authenticatedStudent,
                        lessonId,
                        request
                )
        );
    }

    @GetMapping(
            "/attempts/{attemptId}/result"
    )
    public ResponseEntity<QuizResultResponse> findAttemptResult(
            @PathVariable Long attemptId,
            Authentication authentication
    ) {
        User authenticatedStudent =
                getAuthenticatedUser(
                        authentication
                );

        return ResponseEntity.ok(
                quizService.findAttemptResult(
                        authenticatedStudent,
                        attemptId
                )
        );
    }

    @GetMapping(
            "/lessons/{lessonId}/attempts"
    )
    public ResponseEntity<List<QuizAttemptResponse>> findAttempts(
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        User authenticatedStudent =
                getAuthenticatedUser(
                        authentication
                );

        return ResponseEntity.ok(
                quizService.findAttempts(
                        authenticatedStudent,
                        lessonId
                )
        );
    }

    private User getAuthenticatedUser(
            Authentication authentication
    ) {
        return (User) authentication
                .getPrincipal();
    }
}