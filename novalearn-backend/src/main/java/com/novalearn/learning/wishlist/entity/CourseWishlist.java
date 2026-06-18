package com.novalearn.learning.wishlist.entity;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.course.entity.Course;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "course_wishlist",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_course_wishlist_student_course",
                        columnNames = {"student_id", "course_id"}
                )
        },
        indexes = {
                @Index(name = "idx_course_wishlist_student", columnList = "student_id"),
                @Index(name = "idx_course_wishlist_course", columnList = "course_id")
        }
)
public class CourseWishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void restore() {
        this.deletedAt = null;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
}