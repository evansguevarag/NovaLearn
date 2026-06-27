package com.novalearn.learning.quiz.dto;

import com.novalearn.learning.quiz.entity.QuizOption;
import com.novalearn.learning.quiz.entity.QuizQuestion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class QuizQuestionResponse {

    private final Long id;
    private final Long lessonId;
    private final String questionText;
    private final BigDecimal points;
    private final String explanation;
    private final Integer sortOrder;
    private final Boolean active;
    private final List<QuizOptionResponse> options;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public QuizQuestionResponse(
            QuizQuestion question,
            List<QuizOption> options
    ) {
        this.id = question.getId();

        this.lessonId =
                question.getLesson() != null
                        ? question.getLesson().getId()
                        : null;

        this.questionText =
                question.getQuestionText();

        this.points =
                question.getPoints();

        this.explanation =
                question.getExplanation();

        this.sortOrder =
                question.getSortOrder();

        this.active =
                question.getActive();

        this.options =
                options == null
                        ? List.of()
                        : options.stream()
                                .map(QuizOptionResponse::new)
                                .toList();

        this.createdAt =
                question.getCreatedAt();

        this.updatedAt =
                question.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public BigDecimal getPoints() {
        return points;
    }

    public String getExplanation() {
        return explanation;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public Boolean getActive() {
        return active;
    }

    public List<QuizOptionResponse> getOptions() {
        return options;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}