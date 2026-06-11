package com.novalearn.learning.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CourseReviewRequest {

    @NotNull(message = "El curso es obligatorio")
    private Long courseId;

    @NotNull(message = "La calificacion es obligatoria")
    @Min(value = 1, message = "La calificacion minima es 1")
    @Max(value = 5, message = "La calificacion maxima es 5")
    private Integer rating;

    @Size(max = 2000, message = "El comentario no debe superar 2000 caracteres")
    private String comment;

    public Long getCourseId() {
        return courseId;
    }

    public Integer getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
    }
}