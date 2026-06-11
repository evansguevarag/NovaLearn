package com.novalearn.learning.review.entity;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.course.entity.Course;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "course_reviews",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_course_reviews_student_course",
                        columnNames = {"student_id", "course_id"}
                )
        },
        indexes = {
                @Index(name = "idx_course_reviews_course", columnList = "course_id"),
                @Index(name = "idx_course_reviews_student", columnList = "student_id"),
                @Index(name = "idx_course_reviews_rating", columnList = "rating")
        }
)
public class CourseReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (active == null) active = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
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

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
        this.active = false;
    }
}