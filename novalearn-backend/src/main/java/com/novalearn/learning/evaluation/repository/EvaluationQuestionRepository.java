package com.novalearn.learning.evaluation.repository;

import com.novalearn.learning.evaluation.entity.EvaluationQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvaluationQuestionRepository
        extends JpaRepository<EvaluationQuestion, Long> {

    List<EvaluationQuestion>
    findByEvaluationIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(
            Long evaluationId
    );

    Optional<EvaluationQuestion>
    findByIdAndEvaluationIdAndDeletedAtIsNull(
            Long questionId,
            Long evaluationId
    );

    boolean existsByEvaluationIdAndSortOrderAndDeletedAtIsNull(
            Long evaluationId,
            Integer sortOrder
    );

    boolean existsByEvaluationIdAndSortOrderAndIdNotAndDeletedAtIsNull(
            Long evaluationId,
            Integer sortOrder,
            Long questionId
    );
}