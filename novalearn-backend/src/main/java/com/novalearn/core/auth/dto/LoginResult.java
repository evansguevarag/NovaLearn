package com.novalearn.core.auth.dto;

public record LoginResult(
        LoginResponse response,
        String refreshToken
) {
}
