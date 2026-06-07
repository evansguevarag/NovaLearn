package com.novalearn.learning.quiz.dto;

import jakarta.validation.constraints.NotNull;

public class QuizAnswerRequest {

    @NotNull(message = "La pregunta es obligatoria")
    private Long questionId;

    @NotNull(message = "La opcion seleccionada es obligatoria")
    private Long selectedOptionId;

    public Long getQuestionId() { return questionId; }

    public Long getSelectedOptionId() { return selectedOptionId; }
}