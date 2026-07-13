package com.novalearn.learning.evaluation.dto;

import com.novalearn.learning.evaluation.entity.Evaluation;
import com.novalearn.learning.evaluation.entity.EvaluationAttempt;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StudentEvaluationOverviewResponse {

    private final Long id;
    private final Long courseId;
    private final String courseTitle;
    private final Long moduleId;
    private final String moduleTitle;
    private final String title;
    private final String description;
    private final String evaluationType;
    private final String deliveryMode;
    private final LocalDateTime availableFrom;
    private final LocalDateTime dueAt;
    private final Integer timeLimitMinutes;
    private final Integer maxAttempts;
    private final BigDecimal maxScore;
    private final BigDecimal passingScore;
    private final Long latestAttemptId;
    private final String latestAttemptStatus;
    private final Integer latestAttemptNumber;
    private final LocalDateTime latestAttemptStartedAt;
    private final LocalDateTime latestAttemptSubmittedAt;
    private final BigDecimal latestAttemptScore;
    private final Boolean latestAttemptPassed;
    private final Long attemptsUsed;

    public StudentEvaluationOverviewResponse(
            Evaluation evaluation,
            EvaluationAttempt latestAttempt,
            long attemptsUsed
    ) {
        this.id = evaluation.getId();
        this.courseId = evaluation.getModule().getCourse().getId();
        this.courseTitle = evaluation.getModule().getCourse().getTitle();
        this.moduleId = evaluation.getModule().getId();
        this.moduleTitle = evaluation.getModule().getTitle();
        this.title = evaluation.getTitle();
        this.description = evaluation.getDescription();
        this.evaluationType = evaluation.getEvaluationType().name();
        this.deliveryMode = evaluation.getDeliveryMode().name();
        this.availableFrom = evaluation.getAvailableFrom();
        this.dueAt = evaluation.getDueAt();
        this.timeLimitMinutes = evaluation.getTimeLimitMinutes();
        this.maxAttempts = evaluation.getMaxAttempts();
        this.maxScore = evaluation.getMaxScore();
        this.passingScore = evaluation.getPassingScore();
        this.attemptsUsed = attemptsUsed;

        this.latestAttemptId = latestAttempt != null ? latestAttempt.getId() : null;
        this.latestAttemptStatus =
                latestAttempt != null ? latestAttempt.getStatus().name() : null;
        this.latestAttemptNumber =
                latestAttempt != null ? latestAttempt.getAttemptNumber() : null;
        this.latestAttemptStartedAt =
                latestAttempt != null ? latestAttempt.getStartedAt() : null;
        this.latestAttemptSubmittedAt =
                latestAttempt != null ? latestAttempt.getSubmittedAt() : null;
        this.latestAttemptScore =
                latestAttempt != null ? latestAttempt.getScore() : null;
        this.latestAttemptPassed =
                latestAttempt != null ? latestAttempt.getPassed() : null;
    }

    public Long getId() { return id; }
    public Long getCourseId() { return courseId; }
    public String getCourseTitle() { return courseTitle; }
    public Long getModuleId() { return moduleId; }
    public String getModuleTitle() { return moduleTitle; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getEvaluationType() { return evaluationType; }
    public String getDeliveryMode() { return deliveryMode; }
    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public LocalDateTime getDueAt() { return dueAt; }
    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public Integer getMaxAttempts() { return maxAttempts; }
    public BigDecimal getMaxScore() { return maxScore; }
    public BigDecimal getPassingScore() { return passingScore; }
    public Long getLatestAttemptId() { return latestAttemptId; }
    public String getLatestAttemptStatus() { return latestAttemptStatus; }
    public Integer getLatestAttemptNumber() { return latestAttemptNumber; }
    public LocalDateTime getLatestAttemptStartedAt() { return latestAttemptStartedAt; }
    public LocalDateTime getLatestAttemptSubmittedAt() { return latestAttemptSubmittedAt; }
    public BigDecimal getLatestAttemptScore() { return latestAttemptScore; }
    public Boolean getLatestAttemptPassed() { return latestAttemptPassed; }
    public Long getAttemptsUsed() { return attemptsUsed; }
}
