package com.novalearn.learning.evaluation.dto;

import com.novalearn.learning.evaluation.enums.EvaluationDeliveryMode;
import com.novalearn.learning.evaluation.enums.EvaluationStatus;
import com.novalearn.learning.evaluation.enums.EvaluationType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EvaluationRequest {

    @NotNull(message = "El módulo es obligatorio")
    private Long moduleId;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 255, message = "El título no debe superar 255 caracteres")
    private String title;

    private String description;
    private String instructions;

    @NotNull(message = "El tipo de evaluación es obligatorio")
    private EvaluationType evaluationType;

    @NotNull(message = "La modalidad es obligatoria")
    private EvaluationDeliveryMode deliveryMode;

    private EvaluationStatus status;
    private LocalDateTime availableFrom;
    private LocalDateTime dueAt;

    @Min(value = 1, message = "El tiempo límite debe ser mayor que cero")
    private Integer timeLimitMinutes;

    @Min(value = 1, message = "Debe permitirse al menos un intento")
    private Integer maxAttempts;

    @DecimalMin(value = "0.01", message = "El puntaje máximo debe ser mayor que cero")
    private BigDecimal maxScore;

    @DecimalMin(value = "0.00", message = "El puntaje aprobatorio no puede ser negativo")
    private BigDecimal passingScore;

    private Boolean shuffleQuestions;
    private Boolean showResults;
    private Boolean showCorrectAnswers;
    private Boolean allowLateSubmission;

    @Min(value = 1, message = "La cantidad máxima de archivos debe ser mayor que cero")
    private Integer maxFiles;

    @Min(value = 1, message = "El tamaño máximo debe ser mayor que cero")
    private Integer maxFileSizeMb;

    @Size(max = 500, message = "Las extensiones permitidas no deben superar 500 caracteres")
    private String allowedFileExtensions;

    private Boolean visibleInContent;

    @Min(value = 1, message = "El orden debe ser mayor que cero")
    private Integer sortOrder;

    public Long getModuleId() { return moduleId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getInstructions() { return instructions; }
    public EvaluationType getEvaluationType() { return evaluationType; }
    public EvaluationDeliveryMode getDeliveryMode() { return deliveryMode; }
    public EvaluationStatus getStatus() { return status; }
    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public LocalDateTime getDueAt() { return dueAt; }
    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public Integer getMaxAttempts() { return maxAttempts; }
    public BigDecimal getMaxScore() { return maxScore; }
    public BigDecimal getPassingScore() { return passingScore; }
    public Boolean getShuffleQuestions() { return shuffleQuestions; }
    public Boolean getShowResults() { return showResults; }
    public Boolean getShowCorrectAnswers() { return showCorrectAnswers; }
    public Boolean getAllowLateSubmission() { return allowLateSubmission; }
    public Integer getMaxFiles() { return maxFiles; }
    public Integer getMaxFileSizeMb() { return maxFileSizeMb; }
    public String getAllowedFileExtensions() { return allowedFileExtensions; }
    public Boolean getVisibleInContent() { return visibleInContent; }
    public Integer getSortOrder() { return sortOrder; }
}