package com.novalearn.notification.internal.dto;

import com.novalearn.notification.internal.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateNotificationRequest {

    @NotNull(message = "El usuario es obligatorio")
    private Long userId;

    @NotBlank(message = "El titulo es obligatorio")
    @Size(max = 255, message = "El titulo no debe superar 255 caracteres")
    private String title;

    @NotBlank(message = "El mensaje es obligatorio")
    private String message;

    private NotificationType notificationType;

    public Long getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }
}