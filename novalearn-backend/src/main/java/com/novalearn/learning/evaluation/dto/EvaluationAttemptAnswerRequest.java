package com.novalearn.learning.evaluation.dto;

import java.util.List;

public class EvaluationAttemptAnswerRequest {

    private Long questionId;
    private String textAnswer;
    private List<Long> selectedOptionIds;

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getTextAnswer() { return textAnswer; }
    public void setTextAnswer(String textAnswer) {
        this.textAnswer = textAnswer;
    }

    public List<Long> getSelectedOptionIds() {
        return selectedOptionIds;
    }

    public void setSelectedOptionIds(
            List<Long> selectedOptionIds
    ) {
        this.selectedOptionIds = selectedOptionIds;
    }
}