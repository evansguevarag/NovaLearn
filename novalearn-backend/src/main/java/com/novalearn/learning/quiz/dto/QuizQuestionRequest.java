package com.novalearn.learning.quiz.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class QuizQuestionRequest {

    @NotNull(message = "La leccion es obligatoria")
    private Long lessonId;

    @NotBlank(message = "La pregunta es obligatoria")
    private String questionText;

    @Min(value = 1, message = "El orden debe ser mayor o igual a 1")
    private Integer sortOrder;

    private Boolean active;

    public Long getLessonId() { return lessonId; }

    public String getQuestionText() { return questionText; }

    public Integer getSortOrder() { return sortOrder; }

    public Boolean getActive() { return active; }
}