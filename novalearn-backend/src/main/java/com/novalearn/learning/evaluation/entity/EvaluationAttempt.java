package com.novalearn.learning.evaluation.entity;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.evaluation.enums.EvaluationAttemptStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "evaluation_attempts",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_evaluation_attempts_number",
                        columnNames = {
                                "evaluation_id",
                                "student_id",
                                "attempt_number"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_evaluation_attempts_evaluation",
                        columnList = "evaluation_id"
                ),
                @Index(
                        name = "idx_evaluation_attempts_student",
                        columnList = "student_id"
                ),
                @Index(
                        name = "idx_evaluation_attempts_status",
                        columnList = "status"
                )
        }
)
public class EvaluationAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private Evaluation evaluation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EvaluationAttemptStatus status =
            EvaluationAttemptStatus.IN_PROGRESS;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(precision = 7, scale = 2)
    private BigDecimal score;

    private Boolean passed;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (status == null) {
            status = EvaluationAttemptStatus.IN_PROGRESS;
        }

        if (startedAt == null) {
            startedAt = now;
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

    public void submitForManualReview(BigDecimal partialScore) {
        this.status = EvaluationAttemptStatus.SUBMITTED;
        this.score = partialScore;
        this.passed = null;
        this.submittedAt = LocalDateTime.now();
    }

    public void grade(BigDecimal finalScore, Boolean passed) {
        this.status = EvaluationAttemptStatus.GRADED;
        this.score = finalScore;
        this.passed = passed;
        this.submittedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public Evaluation getEvaluation() { return evaluation; }
    public void setEvaluation(Evaluation evaluation) {
        this.evaluation = evaluation;
    }

    public User getStudent() { return student; }
    public void setStudent(User student) {
        this.student = student;
    }

    public Integer getAttemptNumber() { return attemptNumber; }
    public void setAttemptNumber(Integer attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public EvaluationAttemptStatus getStatus() { return status; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }

    public BigDecimal getScore() { return score; }
    public Boolean getPassed() { return passed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}