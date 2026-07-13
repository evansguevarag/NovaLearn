package com.novalearn.core.auth.dto;

import java.time.LocalDateTime;

public class LoginOtpChallengeResponse {

    private final String challengeId;
    private final String email;
    private final LocalDateTime expiresAt;
    private final long expiresInSeconds;

    public LoginOtpChallengeResponse(
            String challengeId,
            String email,
            LocalDateTime expiresAt,
            long expiresInSeconds
    ) {
        this.challengeId = challengeId;
        this.email = email;
        this.expiresAt = expiresAt;
        this.expiresInSeconds = expiresInSeconds;
    }

    public String getChallengeId() {
        return challengeId;
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }
}
