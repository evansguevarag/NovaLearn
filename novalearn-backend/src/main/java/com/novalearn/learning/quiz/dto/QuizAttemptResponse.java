package com.novalearn.learning.quiz.dto;

import com.novalearn.learning.quiz.entity.QuizAttempt;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class QuizAttemptResponse {

    private Long id;
    private Long studentId;
    private Long lessonId;
    private BigDecimal score;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Boolean passed;
    private LocalDateTime attemptedAt;

    public QuizAttemptResponse(QuizAttempt attempt) {
        this.id = attempt.getId();
        this.studentId = attempt.getStudent().getId();
        this.lessonId = attempt.getLesson().getId();
        this.score = attempt.getScore();
        this.totalQuestions = attempt.getTotalQuestions();
        this.correctAnswers = attempt.getCorrectAnswers();
        this.passed = attempt.getPassed();
        this.attemptedAt = attempt.getAttemptedAt();
    }

    public Long getId() { return id; }

    public Long getStudentId() { return studentId; }

    public Long getLessonId() { return lessonId; }

    public BigDecimal getScore() { return score; }

    public Integer getTotalQuestions() { return totalQuestions; }

    public Integer getCorrectAnswers() { return correctAnswers; }

    public Boolean getPassed() { return passed; }

    public LocalDateTime getAttemptedAt() { return attemptedAt; }
}