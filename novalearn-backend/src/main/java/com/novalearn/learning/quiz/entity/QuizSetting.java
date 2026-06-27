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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "quiz_settings",
        indexes = {
                @Index(
                        name = "idx_quiz_settings_lesson",
                        columnList = "lesson_id",
                        unique = true
                )
        }
)
public class QuizSetting {

    private static final BigDecimal DEFAULT_PASSING_SCORE =
            new BigDecimal("70.00");

    private static final Integer DEFAULT_MAX_ATTEMPTS =
            3;

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "lesson_id",
            nullable = false,
            unique = true
    )
    private Lesson lesson;

    @Column(
            name = "passing_score",
            nullable = false,
            precision = 5,
            scale = 2
    )
    private BigDecimal passingScore =
            DEFAULT_PASSING_SCORE;

    @Column(
            name = "max_attempts",
            nullable = false
    )
    private Integer maxAttempts =
            DEFAULT_MAX_ATTEMPTS;

    @Column(
            name = "shuffle_questions",
            nullable = false
    )
    private Boolean shuffleQuestions =
            false;

    @Column(
            name = "shuffle_options",
            nullable = false
    )
    private Boolean shuffleOptions =
            false;

    @Column(
            name = "show_result",
            nullable = false
    )
    private Boolean showResult =
            true;

    @Column(
            name = "show_correct_answers",
            nullable = false
    )
    private Boolean showCorrectAnswers =
            false;

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

        if (passingScore == null) {
            passingScore =
                    DEFAULT_PASSING_SCORE;
        }

        if (maxAttempts == null) {
            maxAttempts =
                    DEFAULT_MAX_ATTEMPTS;
        }

        if (shuffleQuestions == null) {
            shuffleQuestions = false;
        }

        if (shuffleOptions == null) {
            shuffleOptions = false;
        }

        if (showResult == null) {
            showResult = true;
        }

        if (showCorrectAnswers == null) {
            showCorrectAnswers = false;
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

    public BigDecimal getPassingScore() {
        return passingScore;
    }

    public void setPassingScore(
            BigDecimal passingScore
    ) {
        this.passingScore =
                passingScore;
    }

    public Integer getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(
            Integer maxAttempts
    ) {
        this.maxAttempts =
                maxAttempts;
    }

    public Boolean getShuffleQuestions() {
        return shuffleQuestions;
    }

    public void setShuffleQuestions(
            Boolean shuffleQuestions
    ) {
        this.shuffleQuestions =
                shuffleQuestions;
    }

    public Boolean getShuffleOptions() {
        return shuffleOptions;
    }

    public void setShuffleOptions(
            Boolean shuffleOptions
    ) {
        this.shuffleOptions =
                shuffleOptions;
    }

    public Boolean getShowResult() {
        return showResult;
    }

    public void setShowResult(
            Boolean showResult
    ) {
        this.showResult =
                showResult;
    }

    public Boolean getShowCorrectAnswers() {
        return showCorrectAnswers;
    }

    public void setShowCorrectAnswers(
            Boolean showCorrectAnswers
    ) {
        this.showCorrectAnswers =
                showCorrectAnswers;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}