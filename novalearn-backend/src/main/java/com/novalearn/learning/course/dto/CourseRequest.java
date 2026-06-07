package com.novalearn.learning.course.dto;

import com.novalearn.learning.course.enums.CourseStatus;
import com.novalearn.learning.course.enums.CourseType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class CourseRequest {

    @NotNull(message = "El instructor es obligatorio")
    private Long instructorId;

    @NotNull(message = "La categoria es obligatoria")
    private Long categoryId;

    @NotBlank(message = "El titulo es obligatorio")
    @Size(max = 255, message = "El titulo no debe superar 255 caracteres")
    private String title;

    @Size(max = 500, message = "La descripcion corta no debe superar 500 caracteres")
    private String shortDescription;

    private String description;

    private String requirements;

    private String targetAudience;

    private String thumbnailUrl;

    @DecimalMin(value = "0.00", message = "El precio no puede ser negativo")
    private BigDecimal price;

    private CourseType courseType;

    private CourseStatus status;

    private String level;

    private Boolean certificateEnabled;

    public Long getInstructorId() {
        return instructorId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getTitle() {
        return title;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public String getDescription() {
        return description;
    }

    public String getRequirements() {
        return requirements;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public CourseType getCourseType() {
        return courseType;
    }

    public CourseStatus getStatus() {
        return status;
    }

    public String getLevel() {
        return level;
    }

    public Boolean getCertificateEnabled() {
        return certificateEnabled;
    }
}