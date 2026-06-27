package com.novalearn.learning.evaluation.dto;

import com.novalearn.learning.evaluation.entity.EvaluationOption;
import com.novalearn.learning.evaluation.entity.EvaluationQuestion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class EvaluationQuestionResponse {

    private final Long id;
    private final Long evaluationId;
    private final String questionType;
    private final String prompt;
    private final String explanation;
    private final BigDecimal points;
    private final Integer sortOrder;
    private final Boolean required;
    private final List<EvaluationOptionResponse> options;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public EvaluationQuestionResponse(
            EvaluationQuestion question,
            List<EvaluationOption> options
    ) {
        this.id = question.getId();
        this.evaluationId = question.getEvaluation().getId();
        this.questionType = question.getQuestionType().name();
        this.prompt = question.getPrompt();
        this.explanation = question.getExplanation();
        this.points = question.getPoints();
        this.sortOrder = question.getSortOrder();
        this.required = question.getRequired();
        this.options = options == null
                ? List.of()
                : options.stream()
                .map(EvaluationOptionResponse::new)
                .toList();
        this.createdAt = question.getCreatedAt();
        this.updatedAt = question.getUpdatedAt();
    }

    public Long getId() { return id; }
    public Long getEvaluationId() { return evaluationId; }
    public String getQuestionType() { return questionType; }
    public String getPrompt() { return prompt; }
    public String getExplanation() { return explanation; }
    public BigDecimal getPoints() { return points; }
    public Integer getSortOrder() { return sortOrder; }
    public Boolean getRequired() { return required; }
    public List<EvaluationOptionResponse> getOptions() { return options; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}