package com.novalearn.learning.quiz.dto;

import java.math.BigDecimal;
import java.util.List;

public class StudentQuizResponse {

    private final Long lessonId;
    private final String lessonTitle;
    private final Long attemptId;
    private final Integer attemptNumber;
    private final BigDecimal passingScore;
    private final Integer maxAttempts;
    private final Integer remainingAttempts;
    private final Boolean shuffleQuestions;
    private final Boolean shuffleOptions;
    private final Integer totalQuestions;
    private final BigDecimal totalPoints;
    private final List<StudentQuizQuestionResponse> questions;

    public StudentQuizResponse(
            Long lessonId,
            String lessonTitle,
            Long attemptId,
            Integer attemptNumber,
            BigDecimal passingScore,
            Integer maxAttempts,
            Integer remainingAttempts,
            Boolean shuffleQuestions,
            Boolean shuffleOptions,
            List<StudentQuizQuestionResponse> questions
    ) {
        this.lessonId = lessonId;
        this.lessonTitle = lessonTitle;
        this.attemptId = attemptId;
        this.attemptNumber = attemptNumber;
        this.passingScore = passingScore;
        this.maxAttempts = maxAttempts;
        this.remainingAttempts = remainingAttempts;
        this.shuffleQuestions = shuffleQuestions;
        this.shuffleOptions = shuffleOptions;

        this.questions =
                questions == null
                        ? List.of()
                        : List.copyOf(questions);

        this.totalQuestions =
                this.questions.size();

        this.totalPoints =
                this.questions.stream()
                        .map(
                                StudentQuizQuestionResponse::getPoints
                        )
                        .filter(
                                points -> points != null
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );
    }

    public Long getLessonId() {
        return lessonId;
    }

    public String getLessonTitle() {
        return lessonTitle;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    public BigDecimal getPassingScore() {
        return passingScore;
    }

    public Integer getMaxAttempts() {
        return maxAttempts;
    }

    public Integer getRemainingAttempts() {
        return remainingAttempts;
    }

    public Boolean getShuffleQuestions() {
        return shuffleQuestions;
    }

    public Boolean getShuffleOptions() {
        return shuffleOptions;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public BigDecimal getTotalPoints() {
        return totalPoints;
    }

    public List<StudentQuizQuestionResponse> getQuestions() {
        return questions;
    }
}