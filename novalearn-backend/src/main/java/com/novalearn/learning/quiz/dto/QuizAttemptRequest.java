package com.novalearn.learning.quiz.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class QuizAttemptRequest {

    @NotNull(message = "La leccion es obligatoria")
    private Long lessonId;

    @NotEmpty(message = "Debe enviar al menos una respuesta")
    @Valid
    private List<QuizAnswerRequest> answers;

    public Long getLessonId() { return lessonId; }

    public List<QuizAnswerRequest> getAnswers() { return answers; }
}