package com.novalearn.learning.enrollment.dto;

import jakarta.validation.constraints.NotNull;

public class EnrollmentRequest {

    @NotNull(message = "El estudiante es obligatorio")
    private Long studentId;

    @NotNull(message = "El curso es obligatorio")
    private Long courseId;

    public Long getStudentId() {
        return studentId;
    }

    public Long getCourseId() {
        return courseId;
    }
}