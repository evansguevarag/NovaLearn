package com.novalearn.learning.evaluation.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(
        name = "evaluation_attempt_answers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_evaluation_attempt_answers_question",
                        columnNames = {
                                "attempt_id",
                                "question_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_evaluation_attempt_answers_attempt",
                        columnList = "attempt_id"
                ),
                @Index(
                        name = "idx_evaluation_attempt_answers_question",
                        columnList = "question_id"
                )
        }
)
public class EvaluationAttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private EvaluationAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private EvaluationQuestion question;

    @Column(name = "text_answer", columnDefinition = "TEXT")
    private String textAnswer;

    @Column(name = "is_correct")
    private Boolean correct;

    @Column(name = "points_earned", precision = 7, scale = 2)
    private BigDecimal pointsEarned;

    @ManyToMany
    @JoinTable(
            name = "evaluation_answer_options",
            joinColumns = @JoinColumn(name = "answer_id"),
            inverseJoinColumns = @JoinColumn(name = "option_id")
    )
    @OrderBy("sortOrder ASC, id ASC")
    private Set<EvaluationOption> selectedOptions =
            new LinkedHashSet<>();

    @Column(name = "answered_at", nullable = false)
    private LocalDateTime answeredAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (answeredAt == null) {
            answeredAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public EvaluationAttempt getAttempt() { return attempt; }
    public void setAttempt(EvaluationAttempt attempt) {
        this.attempt = attempt;
    }

    public EvaluationQuestion getQuestion() { return question; }
    public void setQuestion(EvaluationQuestion question) {
        this.question = question;
    }

    public String getTextAnswer() { return textAnswer; }
    public void setTextAnswer(String textAnswer) {
        this.textAnswer = textAnswer;
    }

    public Boolean getCorrect() { return correct; }
    public void setCorrect(Boolean correct) {
        this.correct = correct;
    }

    public BigDecimal getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(BigDecimal pointsEarned) {
        this.pointsEarned = pointsEarned;
    }

    public Set<EvaluationOption> getSelectedOptions() {
        return selectedOptions;
    }

    public void replaceSelectedOptions(
            Set<EvaluationOption> options
    ) {
        selectedOptions.clear();
        selectedOptions.addAll(options);
    }

    public LocalDateTime getAnsweredAt() { return answeredAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}