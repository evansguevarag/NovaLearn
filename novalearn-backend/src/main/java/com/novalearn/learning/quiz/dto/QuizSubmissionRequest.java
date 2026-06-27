package com.novalearn.learning.quiz.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class QuizSubmissionRequest {

    @NotNull(message = "El identificador del intento es obligatorio")
    private Long attemptId;

    @Valid
    @NotEmpty(message = "Debe enviar al menos una respuesta")
    private List<QuizAnswerRequest> answers;

    public Long getAttemptId() {
        return attemptId;
    }

    public List<QuizAnswerRequest> getAnswers() {
        return answers;
    }
}