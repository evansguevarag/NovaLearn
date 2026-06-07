package com.novalearn.learning.quiz.entity;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.lesson.entity.Lesson;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "score", nullable = false, precision = 5, scale = 2)
    private BigDecimal score = BigDecimal.ZERO;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions = 0;

    @Column(name = "correct_answers", nullable = false)
    private Integer correctAnswers = 0;

    @Column(name = "passed", nullable = false)
    private Boolean passed = false;

    @Column(name = "attempted_at", nullable = false)
    private LocalDateTime attemptedAt;

    @PrePersist
    protected void onCreate() {
        if (attemptedAt == null) attemptedAt = LocalDateTime.now();
        if (score == null) score = BigDecimal.ZERO;
        if (totalQuestions == null) totalQuestions = 0;
        if (correctAnswers == null) correctAnswers = 0;
        if (passed == null) passed = false;
    }

    public Long getId() { return id; }

    public User getStudent() { return student; }

    public void setStudent(User student) { this.student = student; }

    public Lesson getLesson() { return lesson; }

    public void setLesson(Lesson lesson) { this.lesson = lesson; }

    public BigDecimal getScore() { return score; }

    public void setScore(BigDecimal score) { this.score = score; }

    public Integer getTotalQuestions() { return totalQuestions; }

    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public Integer getCorrectAnswers() { return correctAnswers; }

    public void setCorrectAnswers(Integer correctAnswers) { this.correctAnswers = correctAnswers; }

    public Boolean getPassed() { return passed; }

    public void setPassed(Boolean passed) { this.passed = passed; }

    public LocalDateTime getAttemptedAt() { return attemptedAt; }
}