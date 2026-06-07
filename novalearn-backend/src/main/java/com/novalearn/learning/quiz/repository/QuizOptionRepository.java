package com.novalearn.learning.quiz.repository;

import com.novalearn.learning.quiz.entity.QuizOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizOptionRepository extends JpaRepository<QuizOption, Long> {

    Optional<QuizOption> findByIdAndDeletedAtIsNull(Long id);

    List<QuizOption> findByQuestionIdAndDeletedAtIsNullOrderBySortOrderAsc(Long questionId);
}