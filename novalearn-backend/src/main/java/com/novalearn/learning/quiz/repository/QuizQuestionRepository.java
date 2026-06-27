package com.novalearn.learning.quiz.repository;

import com.novalearn.learning.quiz.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QuizQuestionRepository
        extends JpaRepository<QuizQuestion, Long> {

        List<QuizQuestion>
        findAllByLessonIdAndDeletedAtIsNullOrderBySortOrderAsc(
                Long lessonId
        );

        List<QuizQuestion>
        findAllByLessonIdAndActiveTrueAndDeletedAtIsNullOrderBySortOrderAsc(
                Long lessonId
        );

        Optional<QuizQuestion>
        findByIdAndDeletedAtIsNull(
                Long questionId
        );

        Optional<QuizQuestion>
        findByIdAndLessonIdAndDeletedAtIsNull(
                Long questionId,
                Long lessonId
        );

        boolean existsByLessonIdAndDeletedAtIsNull(
                Long lessonId
        );

        long countByLessonIdAndDeletedAtIsNull(
                Long lessonId
        );

        long countByLessonIdAndActiveTrueAndDeletedAtIsNull(
                Long lessonId
        );
}