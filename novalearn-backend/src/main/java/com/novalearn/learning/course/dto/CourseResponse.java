package com.novalearn.learning.course.dto;

import com.novalearn.learning.course.entity.Course;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CourseResponse {

    private Long id;
    private Long instructorId;
    private String instructorEmail;
    private Long categoryId;
    private String categoryName;
    private String title;
    private String slug;
    private String shortDescription;
    private String description;
    private String requirements;
    private String targetAudience;
    private String thumbnailUrl;
    private BigDecimal price;
    private String courseType;
    private String status;
    private String level;
    private Boolean certificateEnabled;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CourseResponse(Course course) {
        this.id = course.getId();
        this.instructorId = course.getInstructor().getId();
        this.instructorEmail = course.getInstructor().getEmail();
        this.categoryId = course.getCategory().getId();
        this.categoryName = course.getCategory().getName();
        this.title = course.getTitle();
        this.slug = course.getSlug();
        this.shortDescription = course.getShortDescription();
        this.description = course.getDescription();
        this.requirements = course.getRequirements();
        this.targetAudience = course.getTargetAudience();
        this.thumbnailUrl = course.getThumbnailUrl();
        this.price = course.getPrice();
        this.courseType = course.getCourseType().name();
        this.status = course.getStatus().name();
        this.level = course.getLevel();
        this.certificateEnabled = course.getCertificateEnabled();
        this.publishedAt = course.getPublishedAt();
        this.createdAt = course.getCreatedAt();
        this.updatedAt = course.getUpdatedAt();
    }

    public Long getId() { return id; }

    public Long getInstructorId() { return instructorId; }

    public String getInstructorEmail() { return instructorEmail; }

    public Long getCategoryId() { return categoryId; }

    public String getCategoryName() { return categoryName; }

    public String getTitle() { return title; }

    public String getSlug() { return slug; }

    public String getShortDescription() { return shortDescription; }

    public String getDescription() { return description; }

    public String getRequirements() { return requirements; }

    public String getTargetAudience() { return targetAudience; }

    public String getThumbnailUrl() { return thumbnailUrl; }

    public BigDecimal getPrice() { return price; }

    public String getCourseType() { return courseType; }

    public String getStatus() { return status; }

    public String getLevel() { return level; }

    public Boolean getCertificateEnabled() { return certificateEnabled; }

    public LocalDateTime getPublishedAt() { return publishedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
}