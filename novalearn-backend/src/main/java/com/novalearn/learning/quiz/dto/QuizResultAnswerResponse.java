package com.novalearn.learning.quiz.dto;

import com.novalearn.learning.quiz.entity.QuizAttemptAnswer;
import com.novalearn.learning.quiz.entity.QuizOption;

import java.math.BigDecimal;

public class QuizResultAnswerResponse {

    private final Long questionId;
    private final String questionText;
    private final Long selectedOptionId;
    private final String selectedOptionText;
    private final Boolean correct;
    private final BigDecimal pointsEarned;
    private final BigDecimal questionPoints;
    private final Long correctOptionId;
    private final String correctOptionText;
    private final String explanation;

    public QuizResultAnswerResponse(
            QuizAttemptAnswer answer,
            QuizOption correctOption,
            boolean showCorrectAnswer
    ) {
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

        this.correctOptionId =
                showCorrectAnswer
                        && correctOption != null
                        ? correctOption.getId()
                        : null;

        this.correctOptionText =
                showCorrectAnswer
                        && correctOption != null
                        ? correctOption.getOptionText()
                        : null;

        this.explanation =
                showCorrectAnswer
                        && answer.getQuestion() != null
                        ? answer.getQuestion().getExplanation()
                        : null;
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

    public Long getCorrectOptionId() {
        return correctOptionId;
    }

    public String getCorrectOptionText() {
        return correctOptionText;
    }

    public String getExplanation() {
        return explanation;
    }
}