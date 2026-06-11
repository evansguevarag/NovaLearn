package com.novalearn.notification.email.dto;

public class EmailResponse {

    private String id;
    private String message;

    public EmailResponse(String id, String message) {
        this.id = id;
        this.message = message;
    }

    public String getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }
}