package com.novalearn.learning.lesson.dto;

import com.novalearn.learning.lesson.enums.LessonType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class LessonRequest {

    @NotNull(message = "El modulo es obligatorio")
    private Long moduleId;

    @NotBlank(message = "El titulo de la leccion es obligatorio")
    @Size(max = 255, message = "El titulo no debe superar 255 caracteres")
    private String title;

    private String description;

    private String content;

    private String videoUrl;

    private LessonType lessonType;

    @Min(value = 0, message = "La duracion no puede ser negativa")
    private Integer durationMinutes;

    @Min(value = 1, message = "El orden debe ser mayor o igual a 1")
    private Integer sortOrder;

    private Boolean preview;

    private Boolean active;

    public Long getModuleId() {
        return moduleId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getContent() {
        return content;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public LessonType getLessonType() {
        return lessonType;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public Boolean getPreview() {
        return preview;
    }

    public Boolean getActive() {
        return active;
    }
}