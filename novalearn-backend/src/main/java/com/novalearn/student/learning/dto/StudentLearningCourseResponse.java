package com.novalearn.student.learning.dto;

import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.enrollment.entity.Enrollment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class StudentLearningCourseResponse {

    private final Long enrollmentId;
    private final Long courseId;
    private final String courseTitle;
    private final String courseSlug;
    private final String shortDescription;
    private final String description;
    private final String thumbnailUrl;
    private final String categoryName;
    private final String instructorName;
    private final String level;
    private final Boolean certificateEnabled;

    private final BigDecimal progressPercentage;
    private final LocalDateTime enrolledAt;
    private final LocalDateTime completedAt;

    private final Integer totalModules;
    private final Integer totalLessons;
    private final Integer completedLessons;

    private final List<StudentLearningModuleResponse> modules;

    public StudentLearningCourseResponse(
            Enrollment enrollment,
            int totalModules,
            int totalLessons,
            int completedLessons,
            List<StudentLearningModuleResponse> modules
    ) {
        Course course = enrollment.getCourse();

        this.enrollmentId = enrollment.getId();
        this.courseId = course.getId();
        this.courseTitle = course.getTitle();
        this.courseSlug = course.getSlug();
        this.shortDescription = course.getShortDescription();
        this.description = course.getDescription();
        this.thumbnailUrl = course.getThumbnailUrl();
        this.categoryName = course.getCategory().getName();

        this.instructorName =
                course.getInstructor().getFirstName()
                        + " "
                        + course.getInstructor().getLastName();

        this.level = course.getLevel();
        this.certificateEnabled = course.getCertificateEnabled();

        this.progressPercentage = enrollment.getProgressPercentage();
        this.enrolledAt = enrollment.getEnrolledAt();
        this.completedAt = enrollment.getCompletedAt();

        this.totalModules = totalModules;
        this.totalLessons = totalLessons;
        this.completedLessons = completedLessons;
        this.modules = modules;
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

    public String getShortDescription() {
        return shortDescription;
    }

    public String getDescription() {
        return description;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public String getLevel() {
        return level;
    }

    public Boolean getCertificateEnabled() {
        return certificateEnabled;
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

    public Integer getTotalModules() {
        return totalModules;
    }

    public Integer getTotalLessons() {
        return totalLessons;
    }

    public Integer getCompletedLessons() {
        return completedLessons;
    }

    public List<StudentLearningModuleResponse> getModules() {
        return modules;
    }
}