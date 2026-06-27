package com.novalearn.learning.evaluation.repository;

import com.novalearn.learning.evaluation.entity.EvaluationAttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvaluationAttemptAnswerRepository
        extends JpaRepository<EvaluationAttemptAnswer, Long> {

    List<EvaluationAttemptAnswer>
    findByAttemptIdOrderByQuestionSortOrderAscQuestionIdAsc(
            Long attemptId
    );

    Optional<EvaluationAttemptAnswer>
    findByAttemptIdAndQuestionId(
            Long attemptId,
            Long questionId
    );
}