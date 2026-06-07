package com.novalearn.learning.enrollment.dto;

import com.novalearn.learning.enrollment.entity.Enrollment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EnrollmentResponse {

    private Long id;
    private Long studentId;
    private String studentEmail;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;
    private BigDecimal progressPercentage;
    private Boolean active;

    public EnrollmentResponse(Enrollment enrollment) {
        this.id = enrollment.getId();
        this.studentId = enrollment.getStudent().getId();
        this.studentEmail = enrollment.getStudent().getEmail();
        this.courseId = enrollment.getCourse().getId();
        this.courseTitle = enrollment.getCourse().getTitle();
        this.enrolledAt = enrollment.getEnrolledAt();
        this.completedAt = enrollment.getCompletedAt();
        this.progressPercentage = enrollment.getProgressPercentage();
        this.active = enrollment.getActive();
    }

    public Long getId() { return id; }

    public Long getStudentId() { return studentId; }

    public String getStudentEmail() { return studentEmail; }

    public Long getCourseId() { return courseId; }

    public String getCourseTitle() { return courseTitle; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }

    public BigDecimal getProgressPercentage() { return progressPercentage; }

    public Boolean getActive() { return active; }
}