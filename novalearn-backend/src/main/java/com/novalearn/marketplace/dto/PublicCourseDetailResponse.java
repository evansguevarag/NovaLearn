package com.novalearn.marketplace.dto;

import com.novalearn.learning.course.entity.Course;

import java.math.BigDecimal;

public class PublicCourseDetailResponse {

    private Long id;
    private String title;
    private String slug;
    private String shortDescription;
    private String description;
    private String requirements;
    private String targetAudience;
    private String thumbnailUrl;
    private BigDecimal price;
    private String courseType;
    private String level;
    private Boolean certificateEnabled;
    private Long categoryId;
    private String categoryName;
    private Long instructorId;
    private String instructorName;

    public PublicCourseDetailResponse(Course course) {
        this.id = course.getId();
        this.title = course.getTitle();
        this.slug = course.getSlug();
        this.shortDescription = course.getShortDescription();
        this.description = course.getDescription();
        this.requirements = course.getRequirements();
        this.targetAudience = course.getTargetAudience();
        this.thumbnailUrl = course.getThumbnailUrl();
        this.price = course.getPrice();
        this.courseType = course.getCourseType().name();
        this.level = course.getLevel();
        this.certificateEnabled = course.getCertificateEnabled();
        this.categoryId = course.getCategory().getId();
        this.categoryName = course.getCategory().getName();
        this.instructorId = course.getInstructor().getId();
        this.instructorName = course.getInstructor().getFirstName() + " " + course.getInstructor().getLastName();
    }

    public Long getId() { return id; }

    public String getTitle() { return title; }

    public String getSlug() { return slug; }

    public String getShortDescription() { return shortDescription; }

    public String getDescription() { return description; }

    public String getRequirements() { return requirements; }

    public String getTargetAudience() { return targetAudience; }

    public String getThumbnailUrl() { return thumbnailUrl; }

    public BigDecimal getPrice() { return price; }

    public String getCourseType() { return courseType; }

    public String getLevel() { return level; }

    public Boolean getCertificateEnabled() { return certificateEnabled; }

    public Long getCategoryId() { return categoryId; }

    public String getCategoryName() { return categoryName; }

    public Long getInstructorId() { return instructorId; }

    public String getInstructorName() { return instructorName; }
}