package com.novalearn.instructor.dashboard.dto;

import com.novalearn.learning.course.entity.Course;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InstructorCourseResponse {

    private Long id;
    private String title;
    private String slug;
    private String categoryName;
    private String status;
    private String courseType;
    private BigDecimal price;
    private String level;
    private String thumbnailUrl;
    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;

    public InstructorCourseResponse(Course course) {
        this.id = course.getId();
        this.title = course.getTitle();
        this.slug = course.getSlug();
        this.categoryName = course.getCategory().getName();
        this.status = course.getStatus().name();
        this.courseType = course.getCourseType().name();
        this.price = course.getPrice();
        this.level = course.getLevel();
        this.thumbnailUrl = course.getThumbnailUrl();
        this.createdAt = course.getCreatedAt();
        this.publishedAt = course.getPublishedAt();
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

    public String getCategoryName() {
        return categoryName;
    }

    public String getStatus() {
        return status;
    }

    public String getCourseType() {
        return courseType;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getLevel() {
        return level;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }
}