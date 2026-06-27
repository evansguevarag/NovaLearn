package com.novalearn.learning.assignment.dto;

import com.novalearn.learning.assignment.enums.AssignmentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AssignmentRequest {

    @NotNull(message = "El módulo es obligatorio")
    private Long moduleId;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 255, message = "El título no debe superar 255 caracteres")
    private String title;

    @NotBlank(message = "Las instrucciones son obligatorias")
    private String instructions;

    private AssignmentStatus status;
    private LocalDateTime availableFrom;
    private LocalDateTime dueAt;

    @DecimalMin(value = "0.01", message = "El puntaje máximo debe ser mayor que cero")
    private BigDecimal maxScore;

    private Boolean allowTextSubmission;
    private Boolean allowFileSubmission;

    public Long getModuleId() { return moduleId; }
    public String getTitle() { return title; }
    public String getInstructions() { return instructions; }
    public AssignmentStatus getStatus() { return status; }
    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public LocalDateTime getDueAt() { return dueAt; }
    public BigDecimal getMaxScore() { return maxScore; }
    public Boolean getAllowTextSubmission() { return allowTextSubmission; }
    public Boolean getAllowFileSubmission() { return allowFileSubmission; }
}