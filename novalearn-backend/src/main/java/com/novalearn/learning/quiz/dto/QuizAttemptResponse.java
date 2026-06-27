package com.novalearn.learning.quiz.dto;

import com.novalearn.learning.quiz.entity.QuizAttempt;
import com.novalearn.learning.quiz.entity.QuizAttemptAnswer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class QuizAttemptResponse {

    private final Long id;
    private final Long studentId;
    private final Long lessonId;
    private final Integer attemptNumber;
    private final BigDecimal score;
    private final Integer totalQuestions;
    private final Integer correctAnswers;
    private final Boolean passed;
    private final Boolean completed;
    private final LocalDateTime attemptedAt;
    private final LocalDateTime startedAt;
    private final LocalDateTime completedAt;
    private final List<QuizAttemptAnswerResponse> answers;

    public QuizAttemptResponse(
            QuizAttempt attempt,
            List<QuizAttemptAnswer> answers
    ) {
        this.id =
                attempt.getId();

        this.studentId =
                attempt.getStudent() != null
                        ? attempt.getStudent().getId()
                        : null;

        this.lessonId =
                attempt.getLesson() != null
                        ? attempt.getLesson().getId()
                        : null;

        this.attemptNumber =
                attempt.getAttemptNumber();

        this.score =
                attempt.getScore();

        this.totalQuestions =
                attempt.getTotalQuestions();

        this.correctAnswers =
                attempt.getCorrectAnswers();

        this.passed =
                attempt.getPassed();

        this.completed =
                attempt.isCompleted();

        this.attemptedAt =
                attempt.getAttemptedAt();

        this.startedAt =
                attempt.getStartedAt();

        this.completedAt =
                attempt.getCompletedAt();

        this.answers =
                answers == null
                        ? List.of()
                        : answers.stream()
                                .map(QuizAttemptAnswerResponse::new)
                                .toList();
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    public BigDecimal getScore() {
        return score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public Boolean getPassed() {
        return passed;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public LocalDateTime getAttemptedAt() {
        return attemptedAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public List<QuizAttemptAnswerResponse> getAnswers() {
        return answers;
    }
}