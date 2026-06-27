package com.novalearn.learning.evaluation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EvaluationOptionRequest {

    @NotBlank(message = "El texto de la alternativa es obligatorio")
    @Size(max = 2000, message = "La alternativa no debe superar 2000 caracteres")
    private String optionText;

    private Boolean correct;

    @Min(value = 1, message = "El orden de la alternativa debe ser mayor que cero")
    private Integer sortOrder;

    public String getOptionText() { return optionText; }
    public Boolean getCorrect() { return correct; }
    public Integer getSortOrder() { return sortOrder; }
}