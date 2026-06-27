package com.novalearn.learning.assignment.entity;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.assignment.enums.AssignmentStatus;
import com.novalearn.learning.module.entity.CourseModule;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private CourseModule module;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String instructions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AssignmentStatus status = AssignmentStatus.DRAFT;

    @Column(name = "available_from")
    private LocalDateTime availableFrom;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @Column(name = "max_score", nullable = false, precision = 7, scale = 2)
    private BigDecimal maxScore = BigDecimal.valueOf(20);

    @Column(name = "allow_text_submission", nullable = false)
    private Boolean allowTextSubmission = true;

    @Column(name = "allow_file_submission", nullable = false)
    private Boolean allowFileSubmission = true;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (status == null) status = AssignmentStatus.DRAFT;
        if (maxScore == null) maxScore = BigDecimal.valueOf(20);
        if (allowTextSubmission == null) allowTextSubmission = true;
        if (allowFileSubmission == null) allowFileSubmission = true;
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void publish() {
        status = AssignmentStatus.PUBLISHED;
        if (publishedAt == null) publishedAt = LocalDateTime.now();
    }

    public void close() {
        status = AssignmentStatus.CLOSED;
    }

    public void moveToDraft() {
        status = AssignmentStatus.DRAFT;
    }

    public void softDelete() {
        deletedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public CourseModule getModule() { return module; }
    public void setModule(CourseModule module) { this.module = module; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public AssignmentStatus getStatus() { return status; }
    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDateTime availableFrom) { this.availableFrom = availableFrom; }
    public LocalDateTime getDueAt() { return dueAt; }
    public void setDueAt(LocalDateTime dueAt) { this.dueAt = dueAt; }
    public BigDecimal getMaxScore() { return maxScore; }
    public void setMaxScore(BigDecimal maxScore) { this.maxScore = maxScore; }
    public Boolean getAllowTextSubmission() { return allowTextSubmission; }
    public void setAllowTextSubmission(Boolean allowTextSubmission) { this.allowTextSubmission = allowTextSubmission; }
    public Boolean getAllowFileSubmission() { return allowFileSubmission; }
    public void setAllowFileSubmission(Boolean allowFileSubmission) { this.allowFileSubmission = allowFileSubmission; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
}