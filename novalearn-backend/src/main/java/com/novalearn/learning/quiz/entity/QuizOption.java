package com.novalearn.learning.quiz.entity;

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

import java.time.LocalDateTime;

@Entity
@Table(
        name = "quiz_options",
        indexes = {
                @Index(
                        name = "idx_quiz_options_question",
                        columnList = "question_id"
                )
        }
)
public class QuizOption {

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
            name = "question_id",
            nullable = false
    )
    private QuizQuestion question;

    @Column(
            name = "option_text",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String optionText;

    @Column(
            name = "is_correct",
            nullable = false
    )
    private Boolean correct = false;

    @Column(
            name = "sort_order",
            nullable = false
    )
    private Integer sortOrder = 1;

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

        if (correct == null) {
            correct = false;
        }

        if (sortOrder == null) {
            sortOrder = 1;
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

    public QuizQuestion getQuestion() {
        return question;
    }

    public void setQuestion(
            QuizQuestion question
    ) {
        this.question = question;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(
            String optionText
    ) {
        this.optionText = optionText;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public void setCorrect(
            Boolean correct
    ) {
        this.correct = correct;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(
            Integer sortOrder
    ) {
        this.sortOrder = sortOrder;
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

        correct = false;
    }

    public void restore() {
        deletedAt = null;
    }
}