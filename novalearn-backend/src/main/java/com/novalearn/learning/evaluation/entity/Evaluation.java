package com.novalearn.learning.evaluation.entity;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.evaluation.enums.EvaluationDeliveryMode;
import com.novalearn.learning.evaluation.enums.EvaluationStatus;
import com.novalearn.learning.evaluation.enums.EvaluationType;
import com.novalearn.learning.module.entity.CourseModule;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "evaluations",
        indexes = {
                @Index(name = "idx_evaluations_module", columnList = "module_id"),
                @Index(name = "idx_evaluations_status", columnList = "status"),
                @Index(name = "idx_evaluations_type", columnList = "evaluation_type")
        }
)
public class Evaluation {

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

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_type", nullable = false, length = 30)
    private EvaluationType evaluationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_mode", nullable = false, length = 30)
    private EvaluationDeliveryMode deliveryMode =
            EvaluationDeliveryMode.ONLINE_QUIZ;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EvaluationStatus status =
            EvaluationStatus.DRAFT;

    @Column(name = "available_from")
    private LocalDateTime availableFrom;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;

    @Column(name = "max_attempts", nullable = false)
    private Integer maxAttempts = 1;

    @Column(name = "max_score", nullable = false, precision = 7, scale = 2)
    private BigDecimal maxScore =
            BigDecimal.valueOf(20);

    @Column(name = "passing_score", precision = 7, scale = 2)
    private BigDecimal passingScore;

    @Column(name = "shuffle_questions", nullable = false)
    private Boolean shuffleQuestions = false;

    @Column(name = "show_results", nullable = false)
    private Boolean showResults = true;

    @Column(name = "show_correct_answers", nullable = false)
    private Boolean showCorrectAnswers = false;

    @Column(name = "allow_late_submission", nullable = false)
    private Boolean allowLateSubmission = false;

    @Column(name = "max_files")
    private Integer maxFiles;

    @Column(name = "max_file_size_mb")
    private Integer maxFileSizeMb;

    @Column(name = "allowed_file_extensions", length = 500)
    private String allowedFileExtensions;

    @Column(name = "visible_in_content", nullable = false)
    private Boolean visibleInContent = true;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 1;

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

        if (deliveryMode == null) {
            deliveryMode =
                    EvaluationDeliveryMode.ONLINE_QUIZ;
        }

        if (status == null) {
            status = EvaluationStatus.DRAFT;
        }

        if (maxAttempts == null) {
            maxAttempts = 1;
        }

        if (maxScore == null) {
            maxScore = BigDecimal.valueOf(20);
        }

        if (shuffleQuestions == null) {
            shuffleQuestions = false;
        }

        if (showResults == null) {
            showResults = true;
        }

        if (showCorrectAnswers == null) {
            showCorrectAnswers = false;
        }

        if (allowLateSubmission == null) {
            allowLateSubmission = false;
        }

        if (visibleInContent == null) {
            visibleInContent = true;
        }

        if (sortOrder == null) {
            sortOrder = 1;
        }

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void publish() {
        status = EvaluationStatus.PUBLISHED;

        if (publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }
    }

    public void moveToDraft() {
        status = EvaluationStatus.DRAFT;
    }

    public void close() {
        status = EvaluationStatus.CLOSED;
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

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public EvaluationType getEvaluationType() { return evaluationType; }
    public void setEvaluationType(EvaluationType evaluationType) { this.evaluationType = evaluationType; }

    public EvaluationDeliveryMode getDeliveryMode() { return deliveryMode; }
    public void setDeliveryMode(EvaluationDeliveryMode deliveryMode) { this.deliveryMode = deliveryMode; }

    public EvaluationStatus getStatus() { return status; }

    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDateTime availableFrom) { this.availableFrom = availableFrom; }

    public LocalDateTime getDueAt() { return dueAt; }
    public void setDueAt(LocalDateTime dueAt) { this.dueAt = dueAt; }

    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }

    public Integer getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(Integer maxAttempts) { this.maxAttempts = maxAttempts; }

    public BigDecimal getMaxScore() { return maxScore; }
    public void setMaxScore(BigDecimal maxScore) { this.maxScore = maxScore; }

    public BigDecimal getPassingScore() { return passingScore; }
    public void setPassingScore(BigDecimal passingScore) { this.passingScore = passingScore; }

    public Boolean getShuffleQuestions() { return shuffleQuestions; }
    public void setShuffleQuestions(Boolean shuffleQuestions) { this.shuffleQuestions = shuffleQuestions; }

    public Boolean getShowResults() { return showResults; }
    public void setShowResults(Boolean showResults) { this.showResults = showResults; }

    public Boolean getShowCorrectAnswers() { return showCorrectAnswers; }
    public void setShowCorrectAnswers(Boolean showCorrectAnswers) {
        this.showCorrectAnswers = showCorrectAnswers;
    }

    public Boolean getAllowLateSubmission() { return allowLateSubmission; }
    public void setAllowLateSubmission(Boolean allowLateSubmission) {
        this.allowLateSubmission = allowLateSubmission;
    }

    public Integer getMaxFiles() { return maxFiles; }
    public void setMaxFiles(Integer maxFiles) { this.maxFiles = maxFiles; }

    public Integer getMaxFileSizeMb() { return maxFileSizeMb; }
    public void setMaxFileSizeMb(Integer maxFileSizeMb) {
        this.maxFileSizeMb = maxFileSizeMb;
    }

    public String getAllowedFileExtensions() { return allowedFileExtensions; }
    public void setAllowedFileExtensions(String allowedFileExtensions) {
        this.allowedFileExtensions = allowedFileExtensions;
    }

    public Boolean getVisibleInContent() { return visibleInContent; }
    public void setVisibleInContent(Boolean visibleInContent) {
        this.visibleInContent = visibleInContent;
    }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public LocalDateTime getPublishedAt() { return publishedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
}