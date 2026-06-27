package com.novalearn.learning.quiz.repository;

import com.novalearn.learning.quiz.entity.QuizAttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QuizAttemptAnswerRepository
        extends JpaRepository<QuizAttemptAnswer, Long> {

        List<QuizAttemptAnswer>
        findAllByAttemptIdOrderByQuestionSortOrderAsc(
                Long attemptId
        );

        Optional<QuizAttemptAnswer>
        findByAttemptIdAndQuestionId(
                Long attemptId,
                Long questionId
        );

        boolean existsByAttemptIdAndQuestionId(
                Long attemptId,
                Long questionId
        );

        long countByAttemptId(
                Long attemptId
        );

        long countByAttemptIdAndCorrectTrue(
                Long attemptId
        );

        void deleteAllByAttemptId(
                Long attemptId
        );
}