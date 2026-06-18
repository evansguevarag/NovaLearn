package com.novalearn.student.dashboard.dto;

import com.novalearn.learning.enrollment.entity.Enrollment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StudentCourseDashboardResponse {

    private Long enrollmentId;
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private String thumbnailUrl;
    private String categoryName;
    private BigDecimal progressPercentage;
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;

    public StudentCourseDashboardResponse(Enrollment enrollment) {
        this.enrollmentId = enrollment.getId();
        this.courseId = enrollment.getCourse().getId();
        this.courseTitle = enrollment.getCourse().getTitle();
        this.courseSlug = enrollment.getCourse().getSlug();
        this.thumbnailUrl = enrollment.getCourse().getThumbnailUrl();
        this.categoryName = enrollment.getCourse().getCategory().getName();
        this.progressPercentage = enrollment.getProgressPercentage();
        this.enrolledAt = enrollment.getEnrolledAt();
        this.completedAt = enrollment.getCompletedAt();
    }

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public String getCourseSlug() {
        return courseSlug;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public String getCategoryName() {
        return categoryName;
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