package com.novalearn.learning.evaluation.dto;

import com.novalearn.learning.evaluation.entity.Evaluation;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EvaluationResponse {

    private final Long id;
    private final Long moduleId;
    private final String moduleTitle;
    private final Integer moduleSortOrder;
    private final Long courseId;
    private final String courseTitle;
    private final Long createdById;

    private final String title;
    private final String description;
    private final String instructions;
    private final String evaluationType;
    private final String deliveryMode;
    private final String status;

    private final LocalDateTime availableFrom;
    private final LocalDateTime dueAt;
    private final Integer timeLimitMinutes;
    private final Integer maxAttempts;

    private final BigDecimal maxScore;
    private final BigDecimal passingScore;

    private final Boolean shuffleQuestions;
    private final Boolean showResults;
    private final Boolean showCorrectAnswers;
    private final Boolean allowLateSubmission;

    private final Integer maxFiles;
    private final Integer maxFileSizeMb;
    private final String allowedFileExtensions;

    private final Boolean visibleInContent;
    private final Integer sortOrder;

    private final LocalDateTime publishedAt;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public EvaluationResponse(Evaluation evaluation) {
        this.id = evaluation.getId();
        this.moduleId = evaluation.getModule().getId();
        this.moduleTitle = evaluation.getModule().getTitle();
        this.moduleSortOrder = evaluation.getModule().getSortOrder();
        this.courseId = evaluation.getModule().getCourse().getId();
        this.courseTitle = evaluation.getModule().getCourse().getTitle();
        this.createdById = evaluation.getCreatedBy().getId();

        this.title = evaluation.getTitle();
        this.description = evaluation.getDescription();
        this.instructions = evaluation.getInstructions();
        this.evaluationType = evaluation.getEvaluationType().name();
        this.deliveryMode = evaluation.getDeliveryMode().name();
        this.status = evaluation.getStatus().name();

        this.availableFrom = evaluation.getAvailableFrom();
        this.dueAt = evaluation.getDueAt();
        this.timeLimitMinutes = evaluation.getTimeLimitMinutes();
        this.maxAttempts = evaluation.getMaxAttempts();

        this.maxScore = evaluation.getMaxScore();
        this.passingScore = evaluation.getPassingScore();

        this.shuffleQuestions = evaluation.getShuffleQuestions();
        this.showResults = evaluation.getShowResults();
        this.showCorrectAnswers = evaluation.getShowCorrectAnswers();
        this.allowLateSubmission = evaluation.getAllowLateSubmission();

        this.maxFiles = evaluation.getMaxFiles();
        this.maxFileSizeMb = evaluation.getMaxFileSizeMb();
        this.allowedFileExtensions = evaluation.getAllowedFileExtensions();

        this.visibleInContent = evaluation.getVisibleInContent();
        this.sortOrder = evaluation.getSortOrder();

        this.publishedAt = evaluation.getPublishedAt();
        this.createdAt = evaluation.getCreatedAt();
        this.updatedAt = evaluation.getUpdatedAt();
    }

    public Long getId() { return id; }
    public Long getModuleId() { return moduleId; }
    public String getModuleTitle() { return moduleTitle; }
    public Integer getModuleSortOrder() { return moduleSortOrder; }
    public Long getCourseId() { return courseId; }
    public String getCourseTitle() { return courseTitle; }
    public Long getCreatedById() { return createdById; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getInstructions() { return instructions; }
    public String getEvaluationType() { return evaluationType; }
    public String getDeliveryMode() { return deliveryMode; }
    public String getStatus() { return status; }
    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public LocalDateTime getDueAt() { return dueAt; }
    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public Integer getMaxAttempts() { return maxAttempts; }
    public BigDecimal getMaxScore() { return maxScore; }
    public BigDecimal getPassingScore() { return passingScore; }
    public Boolean getShuffleQuestions() { return shuffleQuestions; }
    public Boolean getShowResults() { return showResults; }
    public Boolean getShowCorrectAnswers() { return showCorrectAnswers; }
    public Boolean getAllowLateSubmission() { return allowLateSubmission; }
    public Integer getMaxFiles() { return maxFiles; }
    public Integer getMaxFileSizeMb() { return maxFileSizeMb; }
    public String getAllowedFileExtensions() { return allowedFileExtensions; }
    public Boolean getVisibleInContent() { return visibleInContent; }
    public Integer getSortOrder() { return sortOrder; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}