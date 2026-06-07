package com.novalearn.learning.quiz.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class QuizOptionRequest {

    @NotNull(message = "La pregunta es obligatoria")
    private Long questionId;

    @NotBlank(message = "La opcion es obligatoria")
    private String optionText;

    private Boolean correct;

    @Min(value = 1, message = "El orden debe ser mayor o igual a 1")
    private Integer sortOrder;

    public Long getQuestionId() { return questionId; }

    public String getOptionText() { return optionText; }

    public Boolean getCorrect() { return correct; }

    public Integer getSortOrder() { return sortOrder; }
}