package com.novalearn.learning.evaluation.repository;

import com.novalearn.learning.evaluation.entity.Evaluation;
import com.novalearn.learning.evaluation.enums.EvaluationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    Optional<Evaluation> findByIdAndDeletedAtIsNull(Long id);

    List<Evaluation>
    findByModuleCourseIdAndDeletedAtIsNullOrderByModuleSortOrderAscDueAtAscCreatedAtAsc(
            Long courseId
    );

    List<Evaluation>
    findByModuleCourseIdAndStatusAndDeletedAtIsNullOrderByModuleSortOrderAscDueAtAscCreatedAtAsc(
            Long courseId,
            EvaluationStatus status
    );
}