package com.novalearn.learning.quiz.dto;

import com.novalearn.learning.quiz.entity.QuizSetting;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class QuizSettingResponse {

    private final Long id;
    private final Long lessonId;
    private final BigDecimal passingScore;
    private final Integer maxAttempts;
    private final Boolean shuffleQuestions;
    private final Boolean shuffleOptions;
    private final Boolean showResult;
    private final Boolean showCorrectAnswers;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public QuizSettingResponse(
            QuizSetting setting
    ) {
        this.id = setting.getId();

        this.lessonId =
                setting.getLesson() != null
                        ? setting.getLesson().getId()
                        : null;

        this.passingScore =
                setting.getPassingScore();

        this.maxAttempts =
                setting.getMaxAttempts();

        this.shuffleQuestions =
                setting.getShuffleQuestions();

        this.shuffleOptions =
                setting.getShuffleOptions();

        this.showResult =
                setting.getShowResult();

        this.showCorrectAnswers =
                setting.getShowCorrectAnswers();

        this.createdAt =
                setting.getCreatedAt();

        this.updatedAt =
                setting.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public BigDecimal getPassingScore() {
        return passingScore;
    }

    public Integer getMaxAttempts() {
        return maxAttempts;
    }

    public Boolean getShuffleQuestions() {
        return shuffleQuestions;
    }

    public Boolean getShuffleOptions() {
        return shuffleOptions;
    }

    public Boolean getShowResult() {
        return showResult;
    }

    public Boolean getShowCorrectAnswers() {
        return showCorrectAnswers;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}