package com.novalearn.learning.review.dto;

import com.novalearn.learning.review.entity.CourseReview;

import java.time.LocalDateTime;

public class CourseReviewResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private Integer rating;
    private String comment;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CourseReviewResponse(CourseReview review) {
        this.id = review.getId();
        this.studentId = review.getStudent().getId();
        this.studentName = review.getStudent().getFirstName() + " " + review.getStudent().getLastName();
        this.courseId = review.getCourse().getId();
        this.courseTitle = review.getCourse().getTitle();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.active = review.getActive();
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();
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

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public Integer getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
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