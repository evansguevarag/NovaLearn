package com.novalearn.learning.quiz.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class QuizQuestionRequest {

    @NotBlank(message = "El texto de la pregunta es obligatorio")
    @Size(
            max = 5000,
            message = "El texto de la pregunta no debe superar 5000 caracteres"
    )
    private String questionText;

    @NotNull(message = "El puntaje de la pregunta es obligatorio")
    @DecimalMin(
            value = "0.01",
            message = "El puntaje de la pregunta debe ser mayor a 0"
    )
    private BigDecimal points;

    @Size(
            max = 5000,
            message = "La explicacion no debe superar 5000 caracteres"
    )
    private String explanation;

    @NotNull(message = "El orden de la pregunta es obligatorio")
    @Min(
            value = 1,
            message = "El orden de la pregunta debe ser mayor o igual a 1"
    )
    private Integer sortOrder;

    @NotNull(message = "Debe indicar si la pregunta esta activa")
    private Boolean active;

    @Valid
    @NotEmpty(message = "La pregunta debe tener opciones de respuesta")
    @Size(
            min = 2,
            max = 10,
            message = "La pregunta debe tener entre 2 y 10 opciones"
    )
    private List<QuizOptionRequest> options;

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

    public List<QuizOptionRequest> getOptions() {
        return options;
    }
}