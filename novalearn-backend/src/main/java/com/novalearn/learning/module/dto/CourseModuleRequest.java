package com.novalearn.learning.module.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CourseModuleRequest {

    @NotNull(message = "El curso es obligatorio")
    private Long courseId;

    @NotBlank(message = "El titulo del modulo es obligatorio")
    @Size(max = 255, message = "El titulo no debe superar 255 caracteres")
    private String title;

    private String description;

    @Min(value = 1, message = "El orden debe ser mayor o igual a 1")
    private Integer sortOrder;

    private Boolean active;

    public Long getCourseId() {
        return courseId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public Boolean getActive() {
        return active;
    }
}