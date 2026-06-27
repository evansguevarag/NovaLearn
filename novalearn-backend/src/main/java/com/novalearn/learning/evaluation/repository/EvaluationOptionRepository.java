package com.novalearn.learning.evaluation.repository;

import com.novalearn.learning.evaluation.entity.EvaluationOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationOptionRepository
        extends JpaRepository<EvaluationOption, Long> {

    List<EvaluationOption>
    findByQuestionIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(
            Long questionId
    );
}