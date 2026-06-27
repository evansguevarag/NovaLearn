package com.novalearn.learning.evaluation.repository;

import com.novalearn.learning.evaluation.entity.EvaluationAttempt;
import com.novalearn.learning.evaluation.enums.EvaluationAttemptStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvaluationAttemptRepository
        extends JpaRepository<EvaluationAttempt, Long> {

    Optional<EvaluationAttempt>
    findByIdAndStudentId(
            Long attemptId,
            Long studentId
    );

    Optional<EvaluationAttempt>
    findFirstByEvaluationIdAndStudentIdAndStatusOrderByAttemptNumberDesc(
            Long evaluationId,
            Long studentId,
            EvaluationAttemptStatus status
    );

    List<EvaluationAttempt>
    findByEvaluationIdAndStudentIdOrderByAttemptNumberDesc(
            Long evaluationId,
            Long studentId
    );

    long countByEvaluationIdAndStudentId(
            Long evaluationId,
            Long studentId
    );
}