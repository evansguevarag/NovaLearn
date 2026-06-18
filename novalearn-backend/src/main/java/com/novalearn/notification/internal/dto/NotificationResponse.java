package com.novalearn.notification.internal.dto;

import com.novalearn.notification.internal.entity.UserNotification;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private Long userId;
    private String title;
    private String message;
    private String notificationType;
    private Boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    public NotificationResponse(UserNotification notification) {
        this.id = notification.getId();
        this.userId = notification.getUser().getId();
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.notificationType = notification.getNotificationType().name();
        this.read = notification.isRead();
        this.readAt = notification.getReadAt();
        this.createdAt = notification.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public Boolean getRead() {
        return read;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}