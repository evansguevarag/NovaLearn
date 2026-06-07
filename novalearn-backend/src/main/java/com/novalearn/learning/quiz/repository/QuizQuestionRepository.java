package com.novalearn.learning.quiz.repository;

import com.novalearn.learning.quiz.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    Optional<QuizQuestion> findByIdAndDeletedAtIsNull(Long id);

    List<QuizQuestion> findByLessonIdAndDeletedAtIsNullOrderBySortOrderAsc(Long lessonId);
}
