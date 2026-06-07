package com.novalearn.learning.progress.dto;

import com.novalearn.learning.progress.entity.LessonProgress;

import java.time.LocalDateTime;

public class LessonProgressResponse {

    private Long id;
    private Long enrollmentId;
    private Long lessonId;
    private String lessonTitle;
    private Boolean completed;
    private LocalDateTime completedAt;

    public LessonProgressResponse(LessonProgress progress) {
        this.id = progress.getId();
        this.enrollmentId = progress.getEnrollment().getId();
        this.lessonId = progress.getLesson().getId();
        this.lessonTitle = progress.getLesson().getTitle();
        this.completed = progress.getCompleted();
        this.completedAt = progress.getCompletedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public String getLessonTitle() {
        return lessonTitle;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}
