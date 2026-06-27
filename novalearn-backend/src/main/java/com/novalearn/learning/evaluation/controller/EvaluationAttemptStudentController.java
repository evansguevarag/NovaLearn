package com.novalearn.learning.evaluation.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.evaluation.dto.*;
import com.novalearn.learning.evaluation.service.EvaluationAttemptService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/evaluations")
public class EvaluationAttemptStudentController {

    private final EvaluationAttemptService attemptService;

    public EvaluationAttemptStudentController(
            EvaluationAttemptService attemptService
    ) {
        this.attemptService = attemptService;
    }

    @PostMapping("/{evaluationId}/attempts/start")
    public ResponseEntity<EvaluationAttemptDetailResponse> start(
            @PathVariable Long evaluationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                attemptService.start(
                        evaluationId,
                        user(authentication)
                )
        );
    }

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<EvaluationAttemptDetailResponse> findById(
            @PathVariable Long attemptId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                attemptService.findById(
                        attemptId,
                        user(authentication)
                )
        );
    }

    @PutMapping("/attempts/{attemptId}/answers")
    public ResponseEntity<EvaluationAttemptDetailResponse> saveAnswers(
            @PathVariable Long attemptId,
            @RequestBody EvaluationAttemptSaveRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                attemptService.saveAnswers(
                        attemptId,
                        request,
                        user(authentication)
                )
        );
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<EvaluationAttemptDetailResponse> submit(
            @PathVariable Long attemptId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                attemptService.submit(
                        attemptId,
                        user(authentication)
                )
        );
    }

    @GetMapping("/{evaluationId}/attempts")
    public ResponseEntity<List<EvaluationAttemptSummaryResponse>> history(
            @PathVariable Long evaluationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                attemptService.findHistory(
                        evaluationId,
                        user(authentication)
                )
        );
    }

    private User user(
            Authentication authentication
    ) {
        return (User) authentication.getPrincipal();
    }
}