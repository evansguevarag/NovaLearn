package com.novalearn.learning.quiz.dto;

import com.novalearn.learning.quiz.entity.QuizOption;
import com.novalearn.learning.quiz.entity.QuizQuestion;

import java.math.BigDecimal;
import java.util.List;

public class StudentQuizQuestionResponse {

    private final Long id;
    private final String questionText;
    private final BigDecimal points;
    private final Integer sortOrder;
    private final List<StudentQuizOptionResponse> options;

    public StudentQuizQuestionResponse(
            QuizQuestion question,
            List<QuizOption> options
    ) {
        this.id =
                question.getId();

        this.questionText =
                question.getQuestionText();

        this.points =
                question.getPoints();

        this.sortOrder =
                question.getSortOrder();

        this.options =
                options == null
                        ? List.of()
                        : options.stream()
                                .map(StudentQuizOptionResponse::new)
                                .toList();
    }

    public Long getId() {
        return id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public BigDecimal getPoints() {
        return points;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public List<StudentQuizOptionResponse> getOptions() {
        return options;
    }
}