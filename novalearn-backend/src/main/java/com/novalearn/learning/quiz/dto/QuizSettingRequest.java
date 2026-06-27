package com.novalearn.learning.quiz.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class QuizSettingRequest {

    @NotNull(message = "La nota minima de aprobacion es obligatoria")
    @DecimalMin(
            value = "0.00",
            message = "La nota minima no puede ser menor a 0"
    )
    @DecimalMax(
            value = "100.00",
            message = "La nota minima no puede ser mayor a 100"
    )
    private BigDecimal passingScore;

    @NotNull(message = "La cantidad maxima de intentos es obligatoria")
    @Min(
            value = 1,
            message = "La cantidad maxima de intentos debe ser mayor o igual a 1"
    )
    private Integer maxAttempts;

    @NotNull(message = "Debe indicar si las preguntas se mostraran aleatoriamente")
    private Boolean shuffleQuestions;

    @NotNull(message = "Debe indicar si las opciones se mostraran aleatoriamente")
    private Boolean shuffleOptions;

    @NotNull(message = "Debe indicar si se mostrara el resultado")
    private Boolean showResult;

    @NotNull(message = "Debe indicar si se mostraran las respuestas correctas")
    private Boolean showCorrectAnswers;

    public BigDecimal getPassingScore() {
        return passingScore;
    }

    public Integer getMaxAttempts() {
        return maxAttempts;
    }

    public Boolean getShuffleQuestions() {
        return shuffleQuestions;
    }

    public Boolean getShuffleOptions() {
        return shuffleOptions;
    }

    public Boolean getShowResult() {
        return showResult;
    }

    public Boolean getShowCorrectAnswers() {
        return showCorrectAnswers;
    }
}