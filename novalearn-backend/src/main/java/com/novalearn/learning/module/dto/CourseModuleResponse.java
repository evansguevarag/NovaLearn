package com.novalearn.learning.module.dto;

import com.novalearn.learning.module.entity.CourseModule;

import java.time.LocalDateTime;

public class CourseModuleResponse {

    private Long id;
    private Long courseId;
    private String courseTitle;
    private String title;
    private String description;
    private Integer sortOrder;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CourseModuleResponse(CourseModule module) {
        this.id = module.getId();
        this.courseId = module.getCourse().getId();
        this.courseTitle = module.getCourse().getTitle();
        this.title = module.getTitle();
        this.description = module.getDescription();
        this.sortOrder = module.getSortOrder();
        this.active = module.getActive();
        this.createdAt = module.getCreatedAt();
        this.updatedAt = module.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public Boolean getActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}