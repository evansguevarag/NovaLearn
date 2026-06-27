package com.novalearn.learning.evaluation.dto;

import com.novalearn.learning.evaluation.entity.EvaluationOption;

public class EvaluationAttemptOptionResponse {

    private final Long id;
    private final String optionText;
    private final Integer sortOrder;
    private final Boolean correct;

    public EvaluationAttemptOptionResponse(
            EvaluationOption option,
            boolean revealCorrectness
    ) {
        this.id = option.getId();
        this.optionText = option.getOptionText();
        this.sortOrder = option.getSortOrder();
        this.correct = revealCorrectness
                ? option.getCorrect()
                : null;
    }

    public Long getId() { return id; }
    public String getOptionText() { return optionText; }
    public Integer getSortOrder() { return sortOrder; }
    public Boolean getCorrect() { return correct; }
}