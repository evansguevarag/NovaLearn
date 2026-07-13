package com.novalearn.core.account.dto;

import com.novalearn.core.auth.dto.AuthResponse;

public class ConfirmEmailChangeResponse {

    private final AccountProfileResponse profile;
    private final AuthResponse auth;

    public ConfirmEmailChangeResponse(
            AccountProfileResponse profile,
            AuthResponse auth
    ) {
        this.profile = profile;
        this.auth = auth;
    }

    public AccountProfileResponse getProfile() {
        return profile;
    }

    public AuthResponse getAuth() {
        return auth;
    }
}
