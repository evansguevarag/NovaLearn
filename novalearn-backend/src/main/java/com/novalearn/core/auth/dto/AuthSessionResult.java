package com.novalearn.core.auth.dto;

public record AuthSessionResult(
        AuthResponse response,
        String refreshToken
) {
}