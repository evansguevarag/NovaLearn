package com.novalearn.profile.dto;

public class ProfileMessageResponse {

    private String message;

    public ProfileMessageResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}