package com.novalearn.core.auth.controller;

import com.novalearn.core.auth.cookie.RefreshCookieService;
import com.novalearn.core.auth.dto.AuthResponse;
import com.novalearn.core.auth.dto.AuthSessionResult;
import com.novalearn.core.auth.dto.LoginRequest;
import com.novalearn.core.auth.dto.LogoutResponse;
import com.novalearn.core.auth.dto.RegisterRequest;
import com.novalearn.core.auth.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshCookieService refreshCookieService;
    public AuthController(
            AuthService authService,
            RefreshCookieService refreshCookieService
    ) {
        this.authService = authService;
        this.refreshCookieService = refreshCookieService;
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("auth ok");
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse servletResponse
    ) {
        AuthSessionResult session =
                authService.register(request);

        addRefreshCookie(
                servletResponse,
                session.refreshToken()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(session.response());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse servletResponse
    ) {
        AuthSessionResult session =
                authService.login(request);

        addRefreshCookie(
                servletResponse,
                session.refreshToken()
        );

        return ResponseEntity.ok(
                session.response()
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(
                    name = "novalearn_refresh_token",
                    required = false
            )
            String refreshToken,
            HttpServletResponse servletResponse
    ) {
        validateRefreshCookie(refreshToken);

        AuthSessionResult session =
                authService.refreshToken(
                        refreshToken
                );

        addRefreshCookie(
                servletResponse,
                session.refreshToken()
        );

        return ResponseEntity.ok(
                session.response()
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(
            @CookieValue(
                    name = "novalearn_refresh_token",
                    required = false
            )
            String refreshToken,
            HttpServletResponse servletResponse
    ) {
        authService.logout(refreshToken);

        servletResponse.addHeader(
                HttpHeaders.SET_COOKIE,
                refreshCookieService
                        .clearRefreshCookie()
                        .toString()
        );

        return ResponseEntity.ok(
                new LogoutResponse(
                        "Sesion cerrada correctamente"
                )
        );
    }

    private void addRefreshCookie(
            HttpServletResponse response,
            String refreshToken
    ) {
        response.addHeader(
                HttpHeaders.SET_COOKIE,
                refreshCookieService
                        .createRefreshCookie(
                                refreshToken
                        )
                        .toString()
        );
    }

    private void validateRefreshCookie(
            String refreshToken
    ) {
        if (
                refreshToken == null ||
                refreshToken.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "No existe una sesión renovable"
            );
        }
    }
}