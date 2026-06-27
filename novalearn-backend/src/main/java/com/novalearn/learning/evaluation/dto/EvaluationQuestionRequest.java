package com.novalearn.learning.evaluation.dto;

import com.novalearn.learning.evaluation.enums.EvaluationQuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class EvaluationQuestionRequest {

    @NotNull(message = "El tipo de pregunta es obligatorio")
    private EvaluationQuestionType questionType;

    @NotBlank(message = "El enunciado es obligatorio")
    @Size(max = 10000, message = "El enunciado no debe superar 10000 caracteres")
    private String prompt;

    @Size(max = 10000, message = "La explicación no debe superar 10000 caracteres")
    private String explanation;

    @DecimalMin(value = "0.01", message = "El puntaje debe ser mayor que cero")
    private BigDecimal points;

    @Min(value = 1, message = "El orden debe ser mayor que cero")
    private Integer sortOrder;

    private Boolean required;

    @Valid
    private List<EvaluationOptionRequest> options;

    public EvaluationQuestionType getQuestionType() { return questionType; }
    public String getPrompt() { return prompt; }
    public String getExplanation() { return explanation; }
    public BigDecimal getPoints() { return points; }
    public Integer getSortOrder() { return sortOrder; }
    public Boolean getRequired() { return required; }
    public List<EvaluationOptionRequest> getOptions() { return options; }
}