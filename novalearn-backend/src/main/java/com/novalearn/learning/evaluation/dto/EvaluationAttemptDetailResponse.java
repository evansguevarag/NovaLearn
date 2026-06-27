package com.novalearn.learning.evaluation.dto;

import com.novalearn.learning.evaluation.entity.Evaluation;
import com.novalearn.learning.evaluation.entity.EvaluationAttempt;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class EvaluationAttemptDetailResponse {

    private final Long id;
    private final Long evaluationId;
    private final Long courseId;
    private final String evaluationTitle;
    private final Integer attemptNumber;
    private final String status;
    private final LocalDateTime startedAt;
    private final LocalDateTime submittedAt;
    private final LocalDateTime expiresAt;
    private final Integer timeLimitMinutes;
    private final BigDecimal maxScore;
    private final BigDecimal passingScore;
    private final BigDecimal score;
    private final Boolean passed;
    private final Boolean showResults;
    private final Boolean showCorrectAnswers;
    private final List<EvaluationAttemptQuestionResponse> questions;

    public EvaluationAttemptDetailResponse(
            EvaluationAttempt attempt,
            LocalDateTime expiresAt,
            List<EvaluationAttemptQuestionResponse> questions,
            boolean revealResults
    ) {
        Evaluation evaluation = attempt.getEvaluation();

        this.id = attempt.getId();
        this.evaluationId = evaluation.getId();
        this.courseId =
                evaluation.getModule()
                        .getCourse()
                        .getId();
        this.evaluationTitle = evaluation.getTitle();
        this.attemptNumber = attempt.getAttemptNumber();
        this.status = attempt.getStatus().name();
        this.startedAt = attempt.getStartedAt();
        this.submittedAt = attempt.getSubmittedAt();
        this.expiresAt = expiresAt;
        this.timeLimitMinutes =
                evaluation.getTimeLimitMinutes();
        this.maxScore = evaluation.getMaxScore();
        this.passingScore =
                evaluation.getPassingScore();
        this.score = revealResults
                ? attempt.getScore()
                : null;
        this.passed = revealResults
                ? attempt.getPassed()
                : null;
        this.showResults =
                evaluation.getShowResults();
        this.showCorrectAnswers =
                evaluation.getShowCorrectAnswers();
        this.questions = questions;
    }

    public Long getId() { return id; }
    public Long getEvaluationId() { return evaluationId; }
    public Long getCourseId() { return courseId; }
    public String getEvaluationTitle() { return evaluationTitle; }
    public Integer getAttemptNumber() { return attemptNumber; }
    public String getStatus() { return status; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public BigDecimal getMaxScore() { return maxScore; }
    public BigDecimal getPassingScore() { return passingScore; }
    public BigDecimal getScore() { return score; }
    public Boolean getPassed() { return passed; }
    public Boolean getShowResults() { return showResults; }
    public Boolean getShowCorrectAnswers() {
        return showCorrectAnswers;
    }
    public List<EvaluationAttemptQuestionResponse> getQuestions() {
        return questions;
    }
}