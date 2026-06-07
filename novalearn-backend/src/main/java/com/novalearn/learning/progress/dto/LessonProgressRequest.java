package com.novalearn.learning.progress.dto;

import jakarta.validation.constraints.NotNull;

public class LessonProgressRequest {

    @NotNull(message = "La matricula es obligatoria")
    private Long enrollmentId;

    @NotNull(message = "La leccion es obligatoria")
    private Long lessonId;

    @NotNull(message = "El estado completado es obligatorio")
    private Boolean completed;

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public Boolean getCompleted() {
        return completed;
    }
}