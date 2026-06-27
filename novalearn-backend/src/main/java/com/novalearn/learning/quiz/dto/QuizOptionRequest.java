package com.novalearn.learning.quiz.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class QuizOptionRequest {

    @NotBlank(message = "El texto de la opcion es obligatorio")
    @Size(
            max = 1000,
            message = "El texto de la opcion no debe superar 1000 caracteres"
    )
    private String optionText;

    @NotNull(message = "Debe indicar si la opcion es correcta")
    private Boolean correct;

    @NotNull(message = "El orden de la opcion es obligatorio")
    @Min(
            value = 1,
            message = "El orden de la opcion debe ser mayor o igual a 1"
    )
    private Integer sortOrder;

    public String getOptionText() {
        return optionText;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }
}