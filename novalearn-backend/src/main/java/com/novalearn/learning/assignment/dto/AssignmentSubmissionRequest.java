package com.novalearn.learning.assignment.dto;

import jakarta.validation.constraints.Size;

public class AssignmentSubmissionRequest {

    @Size(max = 20000, message = "La respuesta no debe superar 20000 caracteres")
    private String submissionText;

    private Boolean submit;

    public String getSubmissionText() { return submissionText; }
    public Boolean getSubmit() { return submit; }
}