package com.novalearn.marketplace.dto;

import com.novalearn.learning.course.entity.Course;

import java.math.BigDecimal;

public class StudentCatalogCourseResponse {

    private final Long id;
    private final String title;
    private final String slug;
    private final String shortDescription;
    private final String description;
    private final String requirements;
    private final String targetAudience;
    private final String thumbnailUrl;
    private final BigDecimal price;
    private final String courseType;
    private final String level;
    private final Boolean certificateEnabled;
    private final Long categoryId;
    private final String categoryName;
    private final Long instructorId;
    private final String instructorName;
    private final Boolean enrolled;

    public StudentCatalogCourseResponse(
            Course course,
            boolean enrolled,
            BigDecimal publicPrice
    ) {
        this.id = course.getId();
        this.title = course.getTitle();
        this.slug = course.getSlug();
        this.shortDescription = course.getShortDescription();
        this.description = course.getDescription();
        this.requirements = course.getRequirements();
        this.targetAudience = course.getTargetAudience();
        this.thumbnailUrl = course.getThumbnailUrl();
        this.price = publicPrice;
        this.courseType = course.getCourseType().name();
        this.level = course.getLevel();
        this.certificateEnabled = course.getCertificateEnabled();
        this.categoryId = course.getCategory().getId();
        this.categoryName = course.getCategory().getName();
        this.instructorId = course.getInstructor().getId();
        this.instructorName = buildInstructorName(course);
        this.enrolled = enrolled;
    }

    private String buildInstructorName(Course course) {
        String firstName = course.getInstructor().getFirstName();
        String lastName = course.getInstructor().getLastName();

        return String.join(
                " ",
                firstName != null ? firstName.trim() : "",
                lastName != null ? lastName.trim() : ""
        ).trim();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getSlug() {
        return slug;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public String getDescription() {
        return description;
    }

    public String getRequirements() {
        return requirements;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getCourseType() {
        return courseType;
    }

    public String getLevel() {
        return level;
    }

    public Boolean getCertificateEnabled() {
        return certificateEnabled;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public Long getInstructorId() {
        return instructorId;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public Boolean getEnrolled() {
        return enrolled;
    }
}
