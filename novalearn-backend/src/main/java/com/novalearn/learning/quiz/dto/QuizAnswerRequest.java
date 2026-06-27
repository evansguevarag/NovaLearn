package com.novalearn.learning.quiz.dto;

import jakarta.validation.constraints.NotNull;

public class QuizAnswerRequest {

    @NotNull(message = "El identificador de la pregunta es obligatorio")
    private Long questionId;

    @NotNull(message = "Debe seleccionar una opcion de respuesta")
    private Long selectedOptionId;

    public Long getQuestionId() {
        return questionId;
    }

    public Long getSelectedOptionId() {
        return selectedOptionId;
    }
}