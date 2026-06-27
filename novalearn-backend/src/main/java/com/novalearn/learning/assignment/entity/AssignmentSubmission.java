package com.novalearn.learning.assignment.entity;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.assignment.enums.AssignmentSubmissionStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "assignment_submissions",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_assignment_submissions_assignment_student",
                columnNames = {"assignment_id", "student_id"}
        )
)
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "submission_text", columnDefinition = "TEXT")
    private String submissionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AssignmentSubmissionStatus status = AssignmentSubmissionStatus.DRAFT;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(precision = 7, scale = 2)
    private BigDecimal score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private User gradedBy;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (status == null) status = AssignmentSubmissionStatus.DRAFT;
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void submit(boolean late) {
        status = late ? AssignmentSubmissionStatus.LATE : AssignmentSubmissionStatus.SUBMITTED;
        submittedAt = LocalDateTime.now();
    }

    public void grade(BigDecimal score, String feedback, User grader) {
        this.score = score;
        this.feedback = feedback;
        this.gradedBy = grader;
        this.gradedAt = LocalDateTime.now();
        this.status = AssignmentSubmissionStatus.GRADED;
    }

    public Long getId() { return id; }
    public Assignment getAssignment() { return assignment; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public String getSubmissionText() { return submissionText; }
    public void setSubmissionText(String submissionText) { this.submissionText = submissionText; }
    public AssignmentSubmissionStatus getStatus() { return status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public BigDecimal getScore() { return score; }
    public String getFeedback() { return feedback; }
    public User getGradedBy() { return gradedBy; }
    public LocalDateTime getGradedAt() { return gradedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
}