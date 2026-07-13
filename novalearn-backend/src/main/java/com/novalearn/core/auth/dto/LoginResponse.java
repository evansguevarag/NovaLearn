package com.novalearn.core.auth.dto;

public class LoginResponse {

    private final boolean requiresOtp;
    private final LoginOtpChallengeResponse challenge;
    private final AuthResponse auth;

    public LoginResponse(
            boolean requiresOtp,
            LoginOtpChallengeResponse challenge,
            AuthResponse auth
    ) {
        this.requiresOtp = requiresOtp;
        this.challenge = challenge;
        this.auth = auth;
    }

    public static LoginResponse withOtp(
            LoginOtpChallengeResponse challenge
    ) {
        return new LoginResponse(
                true,
                challenge,
                null
        );
    }

    public static LoginResponse authenticated(
            AuthResponse auth
    ) {
        return new LoginResponse(
                false,
                null,
                auth
        );
    }

    public boolean isRequiresOtp() {
        return requiresOtp;
    }

    public LoginOtpChallengeResponse getChallenge() {
        return challenge;
    }

    public AuthResponse getAuth() {
        return auth;
    }
}
