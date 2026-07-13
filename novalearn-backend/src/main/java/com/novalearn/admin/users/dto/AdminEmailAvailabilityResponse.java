package com.novalearn.admin.users.dto;

public class AdminEmailAvailabilityResponse {

    private final String email;
    private final boolean available;

    public AdminEmailAvailabilityResponse(
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
