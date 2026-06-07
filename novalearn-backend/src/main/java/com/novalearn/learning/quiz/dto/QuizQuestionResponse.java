package com.novalearn.learning.quiz.dto;

import com.novalearn.learning.quiz.entity.QuizQuestion;

public class QuizQuestionResponse {

    private Long id;
    private Long lessonId;
    private String questionText;
    private Integer sortOrder;
    private Boolean active;

    public QuizQuestionResponse(QuizQuestion question) {
        this.id = question.getId();
        this.lessonId = question.getLesson().getId();
        this.questionText = question.getQuestionText();
        this.sortOrder = question.getSortOrder();
        this.active = question.getActive();
    }

    public Long getId() { return id; }

    public Long getLessonId() { return lessonId; }

    public String getQuestionText() { return questionText; }

    public Integer getSortOrder() { return sortOrder; }

    public Boolean getActive() { return active; }
}