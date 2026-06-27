package com.novalearn.learning.evaluation.dto;

import com.novalearn.learning.evaluation.entity.EvaluationAttemptAnswer;
import com.novalearn.learning.evaluation.entity.EvaluationOption;
import com.novalearn.learning.evaluation.entity.EvaluationQuestion;

import java.math.BigDecimal;
import java.util.List;

public class EvaluationAttemptQuestionResponse {

    private final Long id;
    private final String questionType;
    private final String prompt;
    private final String explanation;
    private final BigDecimal points;
    private final Integer sortOrder;
    private final Boolean required;
    private final List<EvaluationAttemptOptionResponse> options;
    private final String textAnswer;
    private final List<Long> selectedOptionIds;
    private final Boolean correct;
    private final BigDecimal pointsEarned;

    public EvaluationAttemptQuestionResponse(
            EvaluationQuestion question,
            List<EvaluationOption> options,
            EvaluationAttemptAnswer answer,
            boolean revealResults,
            boolean revealCorrectAnswers
    ) {
        this.id = question.getId();
        this.questionType =
                question.getQuestionType().name();
        this.prompt = question.getPrompt();
        this.explanation = revealResults
                ? question.getExplanation()
                : null;
        this.points = question.getPoints();
        this.sortOrder = question.getSortOrder();
        this.required = question.getRequired();
        this.options = options.stream()
                .map(
                        option ->
                                new EvaluationAttemptOptionResponse(
                                        option,
                                        revealCorrectAnswers
                                )
                )
                .toList();

        if (answer == null) {
            this.textAnswer = null;
            this.selectedOptionIds = List.of();
            this.correct = null;
            this.pointsEarned = null;
        } else {
            this.textAnswer = answer.getTextAnswer();
            this.selectedOptionIds =
                    answer.getSelectedOptions()
                            .stream()
                            .map(EvaluationOption::getId)
                            .toList();
            this.correct = revealResults
                    ? answer.getCorrect()
                    : null;
            this.pointsEarned = revealResults
                    ? answer.getPointsEarned()
                    : null;
        }
    }

    public Long getId() { return id; }
    public String getQuestionType() { return questionType; }
    public String getPrompt() { return prompt; }
    public String getExplanation() { return explanation; }
    public BigDecimal getPoints() { return points; }
    public Integer getSortOrder() { return sortOrder; }
    public Boolean getRequired() { return required; }
    public List<EvaluationAttemptOptionResponse> getOptions() {
        return options;
    }
    public String getTextAnswer() { return textAnswer; }
    public List<Long> getSelectedOptionIds() {
        return selectedOptionIds;
    }
    public Boolean getCorrect() { return correct; }
    public BigDecimal getPointsEarned() {
        return pointsEarned;
    }
}