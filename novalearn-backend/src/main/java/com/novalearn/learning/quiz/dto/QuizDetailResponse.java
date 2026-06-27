package com.novalearn.learning.quiz.dto;

import java.math.BigDecimal;
import java.util.List;

public class QuizDetailResponse {

    private final Long lessonId;
    private final String lessonTitle;
    private final QuizSettingResponse settings;
    private final Integer totalQuestions;
    private final BigDecimal totalPoints;
    private final List<QuizQuestionResponse> questions;

    public QuizDetailResponse(
            Long lessonId,
            String lessonTitle,
            QuizSettingResponse settings,
            List<QuizQuestionResponse> questions
    ) {
        this.lessonId = lessonId;
        this.lessonTitle = lessonTitle;
        this.settings = settings;

        this.questions =
                questions == null
                        ? List.of()
                        : List.copyOf(questions);

        this.totalQuestions =
                this.questions.size();

        this.totalPoints =
                this.questions.stream()
                        .map(QuizQuestionResponse::getPoints)
                        .filter(points -> points != null)
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

    public QuizSettingResponse getSettings() {
        return settings;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public BigDecimal getTotalPoints() {
        return totalPoints;
    }

    public List<QuizQuestionResponse> getQuestions() {
        return questions;
    }
}