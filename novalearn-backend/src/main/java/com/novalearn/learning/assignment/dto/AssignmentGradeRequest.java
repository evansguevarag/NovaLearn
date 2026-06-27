package com.novalearn.learning.assignment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class AssignmentGradeRequest {

    @NotNull(message = "La calificación es obligatoria")
    @DecimalMin(value = "0.00", message = "La calificación no puede ser negativa")
    private BigDecimal score;

    @Size(max = 10000, message = "La retroalimentación no debe superar 10000 caracteres")
    private String feedback;

    public BigDecimal getScore() { return score; }
    public String getFeedback() { return feedback; }
}