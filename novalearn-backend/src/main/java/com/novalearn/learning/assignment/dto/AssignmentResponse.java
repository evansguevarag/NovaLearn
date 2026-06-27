package com.novalearn.learning.assignment.dto;

import com.novalearn.learning.assignment.entity.Assignment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AssignmentResponse {

    private final Long id;
    private final Long moduleId;
    private final String moduleTitle;
    private final Integer moduleSortOrder;
    private final Long courseId;
    private final String courseTitle;
    private final Long createdById;
    private final String title;
    private final String instructions;
    private final String status;
    private final LocalDateTime availableFrom;
    private final LocalDateTime dueAt;
    private final BigDecimal maxScore;
    private final Boolean allowTextSubmission;
    private final Boolean allowFileSubmission;
    private final LocalDateTime publishedAt;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public AssignmentResponse(Assignment assignment) {
        this.id = assignment.getId();
        this.moduleId = assignment.getModule().getId();
        this.moduleTitle = assignment.getModule().getTitle();
        this.moduleSortOrder = assignment.getModule().getSortOrder();
        this.courseId = assignment.getModule().getCourse().getId();
        this.courseTitle = assignment.getModule().getCourse().getTitle();
        this.createdById = assignment.getCreatedBy().getId();
        this.title = assignment.getTitle();
        this.instructions = assignment.getInstructions();
        this.status = assignment.getStatus().name();
        this.availableFrom = assignment.getAvailableFrom();
        this.dueAt = assignment.getDueAt();
        this.maxScore = assignment.getMaxScore();
        this.allowTextSubmission = assignment.getAllowTextSubmission();
        this.allowFileSubmission = assignment.getAllowFileSubmission();
        this.publishedAt = assignment.getPublishedAt();
        this.createdAt = assignment.getCreatedAt();
        this.updatedAt = assignment.getUpdatedAt();
    }

    public Long getId() { return id; }
    public Long getModuleId() { return moduleId; }
    public String getModuleTitle() { return moduleTitle; }
    public Integer getModuleSortOrder() { return moduleSortOrder; }
    public Long getCourseId() { return courseId; }
    public String getCourseTitle() { return courseTitle; }
    public Long getCreatedById() { return createdById; }
    public String getTitle() { return title; }
    public String getInstructions() { return instructions; }
    public String getStatus() { return status; }
    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public LocalDateTime getDueAt() { return dueAt; }
    public BigDecimal getMaxScore() { return maxScore; }
    public Boolean getAllowTextSubmission() { return allowTextSubmission; }
    public Boolean getAllowFileSubmission() { return allowFileSubmission; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}