package com.novalearn.core.account.dto;

import java.time.LocalDateTime;

public class EmailChangeChallengeResponse {

    private final String challengeId;
    private final String maskedEmail;
    private final LocalDateTime expiresAt;
    private final long expiresInSeconds;

    public EmailChangeChallengeResponse(
            String challengeId,
            String maskedEmail,
            LocalDateTime expiresAt,
            long expiresInSeconds
    ) {
        this.challengeId = challengeId;
        this.maskedEmail = maskedEmail;
        this.expiresAt = expiresAt;
        this.expiresInSeconds = expiresInSeconds;
    }

    public String getChallengeId() {
        return challengeId;
    }

    public String getMaskedEmail() {
        return maskedEmail;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }
}
