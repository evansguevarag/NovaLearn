package com.novalearn.learning.quiz.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.quiz.dto.*;
import com.novalearn.learning.quiz.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/admin/quiz/questions")
    public ResponseEntity<QuizQuestionResponse> createQuestion(
            @Valid @RequestBody QuizQuestionRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(quizService.createQuestion(request));
    }

    @PostMapping("/admin/quiz/options")
    public ResponseEntity<QuizOptionResponse> createOption(
            @Valid @RequestBody QuizOptionRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(quizService.createOption(request));
    }

    @GetMapping("/student/quiz/lessons/{lessonId}/questions")
    public ResponseEntity<List<QuizQuestionResponse>> findQuestions(
            @PathVariable Long lessonId
    ) {
        return ResponseEntity.ok(quizService.findQuestionsByLesson(lessonId));
    }

    @GetMapping("/student/quiz/questions/{questionId}/options")
    public ResponseEntity<List<QuizOptionResponse>> findOptions(
            @PathVariable Long questionId
    ) {
        return ResponseEntity.ok(quizService.findOptionsByQuestion(questionId));
    }

    @PostMapping("/student/quiz/attempts")
    public ResponseEntity<QuizAttemptResponse> submitAttempt(
            Authentication authentication,
            @Valid @RequestBody QuizAttemptRequest request
    ) {
        User student = (User) authentication.getPrincipal();
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(quizService.submitAttempt(student, request));
    }

    @GetMapping("/student/quiz/lessons/{lessonId}/attempts")
    public ResponseEntity<List<QuizAttemptResponse>> findAttempts(
            Authentication authentication,
            @PathVariable Long lessonId
    ) {
        User student = (User) authentication.getPrincipal();
        return ResponseEntity.ok(quizService.findAttempts(student, lessonId));
    }
}