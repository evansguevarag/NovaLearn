package com.novalearn.learning.quiz.dto;

import com.novalearn.learning.quiz.entity.QuizAttempt;
import com.novalearn.learning.quiz.entity.QuizSetting;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class QuizResultResponse {

    private final Long attemptId;
    private final Long lessonId;
    private final Integer attemptNumber;
    private final Boolean completed;
    private final Boolean showResult;
    private final Boolean showCorrectAnswers;
    private final BigDecimal score;
    private final Integer totalQuestions;
    private final Integer correctAnswers;
    private final Boolean passed;
    private final LocalDateTime completedAt;
    private final List<QuizResultAnswerResponse> answers;

    public QuizResultResponse(
            QuizAttempt attempt,
            QuizSetting setting,
            List<QuizResultAnswerResponse> answers
    ) {
        this.attemptId =
                attempt.getId();

        this.lessonId =
                attempt.getLesson() != null
                        ? attempt.getLesson().getId()
                        : null;

        this.attemptNumber =
                attempt.getAttemptNumber();

        this.completed =
                attempt.isCompleted();

        this.showResult =
                setting == null
                        || Boolean.TRUE.equals(
                                setting.getShowResult()
                        );

        this.showCorrectAnswers =
                setting != null
                        && Boolean.TRUE.equals(
                                setting.getShowCorrectAnswers()
                        );

        this.score =
                this.showResult
                        ? attempt.getScore()
                        : null;

        this.totalQuestions =
                this.showResult
                        ? attempt.getTotalQuestions()
                        : null;

        this.correctAnswers =
                this.showResult
                        ? attempt.getCorrectAnswers()
                        : null;

        this.passed =
                this.showResult
                        ? attempt.getPassed()
                        : null;

        this.completedAt =
                attempt.getCompletedAt();

        this.answers =
                this.showResult
                        && answers != null
                        ? List.copyOf(answers)
                        : List.of();
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public Boolean getShowResult() {
        return showResult;
    }

    public Boolean getShowCorrectAnswers() {
        return showCorrectAnswers;
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

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public List<QuizResultAnswerResponse> getAnswers() {
        return answers;
    }
}