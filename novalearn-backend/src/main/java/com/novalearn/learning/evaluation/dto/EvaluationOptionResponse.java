package com.novalearn.learning.evaluation.dto;

import com.novalearn.learning.evaluation.entity.EvaluationOption;

public class EvaluationOptionResponse {

    private final Long id;
    private final String optionText;
    private final Boolean correct;
    private final Integer sortOrder;

    public EvaluationOptionResponse(
            EvaluationOption option
    ) {
        this.id = option.getId();
        this.optionText = option.getOptionText();
        this.correct = option.getCorrect();
        this.sortOrder = option.getSortOrder();
    }

    public Long getId() { return id; }
    public String getOptionText() { return optionText; }
    public Boolean getCorrect() { return correct; }
    public Integer getSortOrder() { return sortOrder; }
}