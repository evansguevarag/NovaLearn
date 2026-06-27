package com.novalearn.learning.evaluation.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.evaluation.dto.EvaluationQuestionRequest;
import com.novalearn.learning.evaluation.dto.EvaluationQuestionResponse;
import com.novalearn.learning.evaluation.service.EvaluationQuestionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor/evaluations/{evaluationId}/questions")
public class EvaluationQuestionInstructorController {

    private final EvaluationQuestionService questionService;

    public EvaluationQuestionInstructorController(
            EvaluationQuestionService questionService
    ) {
        this.questionService = questionService;
    }

    @GetMapping
    public ResponseEntity<List<EvaluationQuestionResponse>> findAll(
            @PathVariable Long evaluationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                questionService.findAll(
                        evaluationId,
                        user(authentication)
                )
        );
    }

    @PostMapping
    public ResponseEntity<EvaluationQuestionResponse> create(
            @PathVariable Long evaluationId,
            @Valid @RequestBody EvaluationQuestionRequest request,
            Authentication authentication
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        questionService.create(
                                evaluationId,
                                request,
                                user(authentication)
                        )
                );
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<EvaluationQuestionResponse> update(
            @PathVariable Long evaluationId,
            @PathVariable Long questionId,
            @Valid @RequestBody EvaluationQuestionRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                questionService.update(
                        evaluationId,
                        questionId,
                        request,
                        user(authentication)
                )
        );
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long evaluationId,
            @PathVariable Long questionId,
            Authentication authentication
    ) {
        questionService.delete(
                evaluationId,
                questionId,
                user(authentication)
        );

        return ResponseEntity.noContent().build();
    }

    private User user(
            Authentication authentication
    ) {
        return (User) authentication.getPrincipal();
    }
}