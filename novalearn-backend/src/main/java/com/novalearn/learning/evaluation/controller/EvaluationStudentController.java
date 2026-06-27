package com.novalearn.learning.evaluation.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.evaluation.dto.EvaluationResponse;
import com.novalearn.learning.evaluation.service.EvaluationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/evaluations")
public class EvaluationStudentController {

    private final EvaluationService evaluationService;

    public EvaluationStudentController(
            EvaluationService evaluationService
    ) {
        this.evaluationService = evaluationService;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EvaluationResponse>> findByCourse(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                evaluationService.findPublishedForStudent(
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
                evaluationService.findPublishedForStudentById(
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