package com.novalearn.learning.evaluation.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.evaluation.dto.EvaluationRequest;
import com.novalearn.learning.evaluation.dto.EvaluationResponse;
import com.novalearn.learning.evaluation.service.EvaluationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/evaluations")
public class EvaluationAdminController {

    private final EvaluationService evaluationService;

    public EvaluationAdminController(
            EvaluationService evaluationService
    ) {
        this.evaluationService = evaluationService;
    }

    @PostMapping
    public ResponseEntity<EvaluationResponse> create(
            @Valid @RequestBody EvaluationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        evaluationService.create(
                                request,
                                user(authentication)
                        )
                );
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EvaluationResponse>> findByCourse(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                evaluationService.findManagedByCourse(
                        courseId,
                        user(authentication)
                )
        );
    }

    @GetMapping("/{evaluationId}")
    public ResponseEntity<EvaluationResponse> findById(
            @PathVariable Long evaluationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                evaluationService.findManagedById(
                        evaluationId,
                        user(authentication)
                )
        );
    }

    @PutMapping("/{evaluationId}")
    public ResponseEntity<EvaluationResponse> update(
            @PathVariable Long evaluationId,
            @Valid @RequestBody EvaluationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                evaluationService.update(
                        evaluationId,
                        request,
                        user(authentication)
                )
        );
    }

    @DeleteMapping("/{evaluationId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long evaluationId,
            Authentication authentication
    ) {
        evaluationService.delete(
                evaluationId,
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