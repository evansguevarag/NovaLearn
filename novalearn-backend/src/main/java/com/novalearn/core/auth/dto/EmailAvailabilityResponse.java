package com.novalearn.core.auth.dto;

public class EmailAvailabilityResponse {

    private final String email;
    private final boolean available;

    public EmailAvailabilityResponse(
            String email,
            boolean available
    ) {
        this.email = email;
        this.available = available;
    }

    public String getEmail() {
        return email;
    }

    public boolean isAvailable() {
        return available;
    }
}
