package com.novalearn.learning.quiz.repository;

import com.novalearn.learning.quiz.entity.QuizOption;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QuizOptionRepository
        extends JpaRepository<QuizOption, Long> {

        List<QuizOption>
        findAllByQuestionIdAndDeletedAtIsNullOrderBySortOrderAsc(
                Long questionId
        );

        Optional<QuizOption>
        findByIdAndDeletedAtIsNull(
                Long optionId
        );

        Optional<QuizOption>
        findByIdAndQuestionIdAndDeletedAtIsNull(
                Long optionId,
                Long questionId
        );

        Optional<QuizOption>
        findByQuestionIdAndCorrectTrueAndDeletedAtIsNull(
                Long questionId
        );

        boolean existsByQuestionIdAndCorrectTrueAndDeletedAtIsNull(
                Long questionId
        );

        boolean existsByQuestionIdAndCorrectTrueAndDeletedAtIsNullAndIdNot(
                Long questionId,
                Long optionId
        );

        long countByQuestionIdAndDeletedAtIsNull(
                Long questionId
        );
}