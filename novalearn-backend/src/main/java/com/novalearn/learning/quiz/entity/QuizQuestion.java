package com.novalearn.learning.quiz.entity;

import com.novalearn.learning.lesson.entity.Lesson;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "quiz_questions",
        indexes = {
                @Index(
                        name = "idx_quiz_questions_lesson",
                        columnList = "lesson_id"
                )
        }
)
public class QuizQuestion {

    private static final BigDecimal DEFAULT_POINTS =
            new BigDecimal("1.00");

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "lesson_id",
            nullable = false
    )
    private Lesson lesson;

    @Column(
            name = "question_text",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String questionText;

    @Column(
            name = "points",
            nullable = false,
            precision = 7,
            scale = 2
    )
    private BigDecimal points =
            DEFAULT_POINTS;

    @Column(
            name = "explanation",
            columnDefinition = "TEXT"
    )
    private String explanation;

    @Column(
            name = "sort_order",
            nullable = false
    )
    private Integer sortOrder = 1;

    @Column(
            name = "is_active",
            nullable = false
    )
    private Boolean active = true;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (points == null) {
            points = DEFAULT_POINTS;
        }

        if (sortOrder == null) {
            sortOrder = 1;
        }

        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public void setLesson(
            Lesson lesson
    ) {
        this.lesson = lesson;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(
            String questionText
    ) {
        this.questionText =
                questionText;
    }

    public BigDecimal getPoints() {
        return points;
    }

    public void setPoints(
            BigDecimal points
    ) {
        this.points = points;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(
            String explanation
    ) {
        this.explanation =
                explanation;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(
            Integer sortOrder
    ) {
        this.sortOrder = sortOrder;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(
            Boolean active
    ) {
        this.active = active;
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

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void softDelete() {
        deletedAt =
                LocalDateTime.now();

        active = false;
    }

    public void restore() {
        deletedAt = null;
        active = true;
    }
}