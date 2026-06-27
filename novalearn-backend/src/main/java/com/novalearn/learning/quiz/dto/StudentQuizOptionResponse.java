package com.novalearn.learning.quiz.dto;

import com.novalearn.learning.quiz.entity.QuizOption;

public class StudentQuizOptionResponse {

    private final Long id;
    private final String optionText;
    private final Integer sortOrder;

    public StudentQuizOptionResponse(
            QuizOption option
    ) {
        this.id =
                option.getId();

        this.optionText =
                option.getOptionText();

        this.sortOrder =
                option.getSortOrder();
    }

    public Long getId() {
        return id;
    }

    public String getOptionText() {
        return optionText;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }
}