package com.novalearn.learning.quiz.repository;

import com.novalearn.learning.quiz.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByStudentIdAndLessonIdOrderByAttemptedAtDesc(Long studentId, Long lessonId);
}