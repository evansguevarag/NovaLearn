package com.novalearn.admin.dashboard.dto;

import com.novalearn.learning.enrollment.entity.Enrollment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LatestEnrollmentResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long courseId;
    private String courseTitle;
    private BigDecimal progressPercentage;
    private LocalDateTime enrolledAt;

    public LatestEnrollmentResponse(Enrollment enrollment) {
        this.id = enrollment.getId();
        this.studentId = enrollment.getStudent().getId();
        this.studentName = buildStudentName(enrollment);
        this.studentEmail = enrollment.getStudent().getEmail();
        this.courseId = enrollment.getCourse().getId();
        this.courseTitle = enrollment.getCourse().getTitle();
        this.progressPercentage = enrollment.getProgressPercentage();
        this.enrolledAt = enrollment.getEnrolledAt();
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
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

    private String buildStudentName(Enrollment enrollment) {
        String firstName = enrollment.getStudent().getFirstName();
        String lastName = enrollment.getStudent().getLastName();
        String fullName = ((firstName != null ? firstName : "") + " " +
                (lastName != null ? lastName : "")).trim();

        return fullName.isBlank()
                ? enrollment.getStudent().getEmail()
                : fullName;
    }
}
