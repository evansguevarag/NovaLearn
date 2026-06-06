package com.novalearn.core.auth.dto;

public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String email;
    private String role;
    private String status;

    public AuthResponse(
            String accessToken,
            String refreshToken,
            Long userId,
            String email,
            String role,
            String status
    ) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.status = status;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }
}