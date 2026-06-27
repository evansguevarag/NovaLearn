package com.novalearn.learning.assignment.dto;

import com.novalearn.learning.assignment.entity.AssignmentSubmission;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AssignmentSubmissionResponse {

    private final Long id;
    private final Long assignmentId;
    private final String assignmentTitle;
    private final Long studentId;
    private final String studentEmail;
    private final String submissionText;
    private final String status;
    private final LocalDateTime submittedAt;
    private final BigDecimal score;
    private final BigDecimal maxScore;
    private final String feedback;
    private final Long gradedById;
    private final LocalDateTime gradedAt;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public AssignmentSubmissionResponse(AssignmentSubmission submission) {
        this.id = submission.getId();
        this.assignmentId = submission.getAssignment().getId();
        this.assignmentTitle = submission.getAssignment().getTitle();
        this.studentId = submission.getStudent().getId();
        this.studentEmail = submission.getStudent().getEmail();
        this.submissionText = submission.getSubmissionText();
        this.status = submission.getStatus().name();
        this.submittedAt = submission.getSubmittedAt();
        this.score = submission.getScore();
        this.maxScore = submission.getAssignment().getMaxScore();
        this.feedback = submission.getFeedback();
        this.gradedById = submission.getGradedBy() != null ? submission.getGradedBy().getId() : null;
        this.gradedAt = submission.getGradedAt();
        this.createdAt = submission.getCreatedAt();
        this.updatedAt = submission.getUpdatedAt();
    }

    public Long getId() { return id; }
    public Long getAssignmentId() { return assignmentId; }
    public String getAssignmentTitle() { return assignmentTitle; }
    public Long getStudentId() { return studentId; }
    public String getStudentEmail() { return studentEmail; }
    public String getSubmissionText() { return submissionText; }
    public String getStatus() { return status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public BigDecimal getScore() { return score; }
    public BigDecimal getMaxScore() { return maxScore; }
    public String getFeedback() { return feedback; }
    public Long getGradedById() { return gradedById; }
    public LocalDateTime getGradedAt() { return gradedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}