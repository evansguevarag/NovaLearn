package com.novalearn.learning.quiz.dto;

import com.novalearn.learning.quiz.entity.QuizOption;

public class QuizOptionResponse {

    private Long id;
    private Long questionId;
    private String optionText;
    private Boolean correct;
    private Integer sortOrder;

    public QuizOptionResponse(QuizOption option) {
        this.id = option.getId();
        this.questionId = option.getQuestion().getId();
        this.optionText = option.getOptionText();
        this.correct = option.getCorrect();
        this.sortOrder = option.getSortOrder();
    }

    public Long getId() { return id; }

    public Long getQuestionId() { return questionId; }

    public String getOptionText() { return optionText; }

    public Boolean getCorrect() { return correct; }

    public Integer getSortOrder() { return sortOrder; }
}