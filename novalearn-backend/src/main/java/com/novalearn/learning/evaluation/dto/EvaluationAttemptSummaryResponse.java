package com.novalearn.learning.evaluation.dto;

import com.novalearn.learning.evaluation.entity.EvaluationAttempt;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EvaluationAttemptSummaryResponse {

    private final Long id;
    private final Long evaluationId;
    private final Integer attemptNumber;
    private final String status;
    private final LocalDateTime startedAt;
    private final LocalDateTime submittedAt;
    private final BigDecimal score;
    private final Boolean passed;

    public EvaluationAttemptSummaryResponse(
            EvaluationAttempt attempt,
            boolean revealResults
    ) {
        this.id = attempt.getId();
        this.evaluationId =
                attempt.getEvaluation().getId();
        this.attemptNumber =
                attempt.getAttemptNumber();
        this.status = attempt.getStatus().name();
        this.startedAt = attempt.getStartedAt();
        this.submittedAt = attempt.getSubmittedAt();
        this.score = revealResults
                ? attempt.getScore()
                : null;
        this.passed = revealResults
                ? attempt.getPassed()
                : null;
    }

    public Long getId() { return id; }
    public Long getEvaluationId() { return evaluationId; }
    public Integer getAttemptNumber() { return attemptNumber; }
    public String getStatus() { return status; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public BigDecimal getScore() { return score; }
    public Boolean getPassed() { return passed; }
}