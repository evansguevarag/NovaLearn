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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "quiz_attempt_answers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_quiz_attempt_answers_attempt_question",
                        columnNames = {
                                "attempt_id",
                                "question_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_quiz_attempt_answers_attempt",
                        columnList = "attempt_id"
                ),
                @Index(
                        name = "idx_quiz_attempt_answers_question",
                        columnList = "question_id"
                )
        }
)
public class QuizAttemptAnswer {

    private static final BigDecimal DEFAULT_POINTS_EARNED =
            new BigDecimal("0.00");

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
            name = "attempt_id",
            nullable = false
    )
    private QuizAttempt attempt;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "question_id",
            nullable = false
    )
    private QuizQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private QuizOption selectedOption;

    @Column(
            name = "is_correct",
            nullable = false
    )
    private Boolean correct = false;

    @Column(
            name = "points_earned",
            nullable = false,
            precision = 7,
            scale = 2
    )
    private BigDecimal pointsEarned =
            DEFAULT_POINTS_EARNED;

    @Column(
            name = "answered_at",
            nullable = false
    )
    private LocalDateTime answeredAt;

    @PrePersist
    protected void onCreate() {
        if (correct == null) {
            correct = false;
        }

        if (pointsEarned == null) {
            pointsEarned =
                    DEFAULT_POINTS_EARNED;
        }

        if (answeredAt == null) {
            answeredAt =
                    LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public QuizAttempt getAttempt() {
        return attempt;
    }

    public void setAttempt(
            QuizAttempt attempt
    ) {
        this.attempt = attempt;
    }

    public QuizQuestion getQuestion() {
        return question;
    }

    public void setQuestion(
            QuizQuestion question
    ) {
        this.question = question;
    }

    public QuizOption getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(
            QuizOption selectedOption
    ) {
        this.selectedOption =
                selectedOption;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public void setCorrect(
            Boolean correct
    ) {
        this.correct = correct;
    }

    public BigDecimal getPointsEarned() {
        return pointsEarned;
    }

    public void setPointsEarned(
            BigDecimal pointsEarned
    ) {
        this.pointsEarned =
                pointsEarned;
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }

    public void evaluate(
            QuizOption selectedOption
    ) {
        this.selectedOption =
                selectedOption;

        boolean selectedIsCorrect =
                selectedOption != null
                        && Boolean.TRUE.equals(
                                selectedOption.getCorrect()
                        );

        this.correct =
                selectedIsCorrect;

        this.pointsEarned =
                selectedIsCorrect
                        ? question.getPoints()
                        : DEFAULT_POINTS_EARNED;

        this.answeredAt =
                LocalDateTime.now();
    }
}