package com.novalearn.core.auth.cookie;

import com.novalearn.core.auth.jwt.JwtProperties;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RefreshCookieService {

    private final RefreshCookieProperties cookieProperties;
    private final JwtProperties jwtProperties;

    public RefreshCookieService(
            RefreshCookieProperties cookieProperties,
            JwtProperties jwtProperties
    ) {
        this.cookieProperties = cookieProperties;
        this.jwtProperties = jwtProperties;
    }

    public String getCookieName() {
        return cookieProperties.getName();
    }

    public ResponseCookie createRefreshCookie(
            String refreshToken
    ) {
        return ResponseCookie
                .from(
                        cookieProperties.getName(),
                        refreshToken
                )
                .httpOnly(true)
                .secure(cookieProperties.isSecure())
                .sameSite(cookieProperties.getSameSite())
                .path(cookieProperties.getPath())
                .maxAge(
                        Duration.ofDays(
                                jwtProperties
                                        .getRefreshTokenExpirationDays()
                        )
                )
                .build();
    }

    public ResponseCookie clearRefreshCookie() {
        return ResponseCookie
                .from(
                        cookieProperties.getName(),
                        ""
                )
                .httpOnly(true)
                .secure(cookieProperties.isSecure())
                .sameSite(cookieProperties.getSameSite())
                .path(cookieProperties.getPath())
                .maxAge(Duration.ZERO)
                .build();
    }
}