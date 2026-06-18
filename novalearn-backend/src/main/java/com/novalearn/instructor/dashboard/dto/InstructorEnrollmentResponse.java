package com.novalearn.instructor.dashboard.dto;

import com.novalearn.learning.enrollment.entity.Enrollment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InstructorEnrollmentResponse {

    private Long enrollmentId;
    private Long studentId;
    private String studentEmail;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private BigDecimal progressPercentage;
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;

    public InstructorEnrollmentResponse(Enrollment enrollment) {
        this.enrollmentId = enrollment.getId();
        this.studentId = enrollment.getStudent().getId();
        this.studentEmail = enrollment.getStudent().getEmail();
        this.studentName = enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName();
        this.courseId = enrollment.getCourse().getId();
        this.courseTitle = enrollment.getCourse().getTitle();
        this.progressPercentage = enrollment.getProgressPercentage();
        this.enrolledAt = enrollment.getEnrolledAt();
        this.completedAt = enrollment.getCompletedAt();
    }

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public String getStudentName() {
        return studentName;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public BigDecimal getProgressPercentage() {
        return progressPercentage;
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}