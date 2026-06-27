package com.novalearn.learning.quiz.dto;

import com.novalearn.learning.quiz.entity.QuizAttemptAnswer;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class QuizAttemptAnswerResponse {

    private final Long id;
    private final Long questionId;
    private final String questionText;
    private final Long selectedOptionId;
    private final String selectedOptionText;
    private final Boolean correct;
    private final BigDecimal pointsEarned;
    private final BigDecimal questionPoints;
    private final LocalDateTime answeredAt;

    public QuizAttemptAnswerResponse(
            QuizAttemptAnswer answer
    ) {
        this.id = answer.getId();

        this.questionId =
                answer.getQuestion() != null
                        ? answer.getQuestion().getId()
                        : null;

        this.questionText =
                answer.getQuestion() != null
                        ? answer.getQuestion().getQuestionText()
                        : null;

        this.selectedOptionId =
                answer.getSelectedOption() != null
                        ? answer.getSelectedOption().getId()
                        : null;

        this.selectedOptionText =
                answer.getSelectedOption() != null
                        ? answer.getSelectedOption().getOptionText()
                        : null;

        this.correct =
                answer.getCorrect();

        this.pointsEarned =
                answer.getPointsEarned();

        this.questionPoints =
                answer.getQuestion() != null
                        ? answer.getQuestion().getPoints()
                        : BigDecimal.ZERO;

        this.answeredAt =
                answer.getAnsweredAt();
    }

    public Long getId() {
        return id;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public Long getSelectedOptionId() {
        return selectedOptionId;
    }

    public String getSelectedOptionText() {
        return selectedOptionText;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public BigDecimal getPointsEarned() {
        return pointsEarned;
    }

    public BigDecimal getQuestionPoints() {
        return questionPoints;
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }
}