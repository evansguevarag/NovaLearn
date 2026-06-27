package com.novalearn.learning.quiz.dto;

import com.novalearn.learning.quiz.entity.QuizOption;

import java.time.LocalDateTime;

public class QuizOptionResponse {

    private final Long id;
    private final Long questionId;
    private final String optionText;
    private final Boolean correct;
    private final Integer sortOrder;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public QuizOptionResponse(
            QuizOption option
    ) {
        this.id = option.getId();

        this.questionId =
                option.getQuestion() != null
                        ? option.getQuestion().getId()
                        : null;

        this.optionText =
                option.getOptionText();

        this.correct =
                option.getCorrect();

        this.sortOrder =
                option.getSortOrder();

        this.createdAt =
                option.getCreatedAt();

        this.updatedAt =
                option.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public String getOptionText() {
        return optionText;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}