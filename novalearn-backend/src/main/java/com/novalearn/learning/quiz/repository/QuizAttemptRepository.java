package com.novalearn.learning.quiz.repository;

import com.novalearn.learning.quiz.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository
        extends JpaRepository<QuizAttempt, Long> {

        List<QuizAttempt>
        findAllByStudentIdAndLessonIdOrderByAttemptNumberDesc(
                Long studentId,
                Long lessonId
        );

        List<QuizAttempt>
        findAllByStudentIdOrderByAttemptedAtDesc(
                Long studentId
        );

        List<QuizAttempt>
        findAllByLessonIdOrderByAttemptedAtDesc(
                Long lessonId
        );

        Optional<QuizAttempt>
        findByIdAndStudentId(
                Long attemptId,
                Long studentId
        );

        Optional<QuizAttempt>
        findFirstByStudentIdAndLessonIdOrderByAttemptNumberDesc(
                Long studentId,
                Long lessonId
        );

        boolean existsByStudentIdAndLessonIdAndCompletedAtIsNull(
                Long studentId,
                Long lessonId
        );

        long countByStudentIdAndLessonId(
                Long studentId,
                Long lessonId
        );

        long countByLessonId(
                Long lessonId
        );

        long countByLessonIdAndPassedTrue(
                Long lessonId
        );
}