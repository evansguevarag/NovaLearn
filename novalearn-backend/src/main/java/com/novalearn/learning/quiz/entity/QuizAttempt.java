package com.novalearn.learning.quiz.entity;

import com.novalearn.core.user.entity.User;
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
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "quiz_attempts",
        indexes = {
                @Index(
                        name = "idx_quiz_attempts_student",
                        columnList = "student_id"
                ),
                @Index(
                        name = "idx_quiz_attempts_lesson",
                        columnList = "lesson_id"
                ),
                @Index(
                        name = "idx_quiz_attempts_student_lesson",
                        columnList = "student_id, lesson_id"
                )
        }
)
public class QuizAttempt {

    private static final BigDecimal DEFAULT_SCORE =
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
            name = "student_id",
            nullable = false
    )
    private User student;

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
            name = "score",
            nullable = false,
            precision = 5,
            scale = 2
    )
    private BigDecimal score =
            DEFAULT_SCORE;

    @Column(
            name = "total_questions",
            nullable = false
    )
    private Integer totalQuestions = 0;

    @Column(
            name = "correct_answers",
            nullable = false
    )
    private Integer correctAnswers = 0;

    @Column(
            name = "passed",
            nullable = false
    )
    private Boolean passed = false;

    @Column(
            name = "attempt_number",
            nullable = false
    )
    private Integer attemptNumber = 1;

    @Column(
            name = "attempted_at",
            nullable = false
    )
    private LocalDateTime attemptedAt;

    @Column(
            name = "started_at",
            nullable = false
    )
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now =
                LocalDateTime.now();

        if (score == null) {
            score = DEFAULT_SCORE;
        }

        if (totalQuestions == null) {
            totalQuestions = 0;
        }

        if (correctAnswers == null) {
            correctAnswers = 0;
        }

        if (passed == null) {
            passed = false;
        }

        if (attemptNumber == null) {
            attemptNumber = 1;
        }

        if (attemptedAt == null) {
            attemptedAt = now;
        }

        if (startedAt == null) {
            startedAt = now;
        }
    }

    public Long getId() {
        return id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(
            User student
    ) {
        this.student = student;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public void setLesson(
            Lesson lesson
    ) {
        this.lesson = lesson;
    }

    public BigDecimal getScore() {
        return score;
    }

    public void setScore(
            BigDecimal score
    ) {
        this.score = score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(
            Integer totalQuestions
    ) {
        this.totalQuestions =
                totalQuestions;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(
            Integer correctAnswers
    ) {
        this.correctAnswers =
                correctAnswers;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(
            Boolean passed
    ) {
        this.passed = passed;
    }

    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(
            Integer attemptNumber
    ) {
        this.attemptNumber =
                attemptNumber;
    }

    public LocalDateTime getAttemptedAt() {
        return attemptedAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public boolean isCompleted() {
        return completedAt != null;
    }

    public void complete(
            BigDecimal score,
            Integer totalQuestions,
            Integer correctAnswers,
            Boolean passed
    ) {
        this.score = score;
        this.totalQuestions =
                totalQuestions;
        this.correctAnswers =
                correctAnswers;
        this.passed = passed;
        this.completedAt =
                LocalDateTime.now();
    }
}