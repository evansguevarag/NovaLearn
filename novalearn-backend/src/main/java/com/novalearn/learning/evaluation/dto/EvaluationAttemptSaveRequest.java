package com.novalearn.learning.evaluation.dto;

import java.util.List;

public class EvaluationAttemptSaveRequest {

    private List<EvaluationAttemptAnswerRequest> answers;

    public List<EvaluationAttemptAnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(
            List<EvaluationAttemptAnswerRequest> answers
    ) {
        this.answers = answers;
    }
}