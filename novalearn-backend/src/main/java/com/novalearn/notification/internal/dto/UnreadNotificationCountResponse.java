package com.novalearn.notification.internal.dto;

public class UnreadNotificationCountResponse {

    private Long unreadCount;

    public UnreadNotificationCountResponse(Long unreadCount) {
        this.unreadCount = unreadCount;
    }

    public Long getUnreadCount() {
        return unreadCount;
    }
}