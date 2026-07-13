package com.novalearn.core.auth.controller;

import com.novalearn.core.auth.cookie.RefreshCookieService;
import com.novalearn.core.auth.dto.AuthResponse;
import com.novalearn.core.auth.dto.AuthSessionResult;
import com.novalearn.core.auth.dto.CompletePasswordResetRequest;
import com.novalearn.core.auth.dto.EmailAvailabilityResponse;
import com.novalearn.core.auth.dto.LoginRequest;
import com.novalearn.core.auth.dto.LoginResponse;
import com.novalearn.core.auth.dto.LoginResult;
import com.novalearn.core.auth.dto.LogoutResponse;
import com.novalearn.core.auth.dto.PasswordResetChallengeResponse;
import com.novalearn.core.auth.dto.PasswordResetRequest;
import com.novalearn.core.auth.dto.RegisterRequest;
import com.novalearn.core.auth.dto.VerifyLoginOtpRequest;
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
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/email-availability")
    public ResponseEntity<EmailAvailabilityResponse> checkEmailAvailability(
            @RequestParam String email
    ) {
        return ResponseEntity.ok(
                authService.checkEmailAvailability(email)
        );
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
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse servletResponse
    ) {
        LoginResult result = authService.login(request);

        if (result.refreshToken() != null) {
            addRefreshCookie(
                    servletResponse,
                    result.refreshToken()
            );
        }

        return ResponseEntity.ok(result.response());
    }

    @PostMapping("/login/verify-otp")
    public ResponseEntity<AuthResponse> verifyLoginOtp(
            @Valid @RequestBody VerifyLoginOtpRequest request,
            HttpServletResponse servletResponse
    ) {
        AuthSessionResult session =
                authService.verifyLoginOtp(request);

        addRefreshCookie(
                servletResponse,
                session.refreshToken()
        );

        return ResponseEntity.ok(
                session.response()
        );
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<PasswordResetChallengeResponse> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest request
    ) {
        return ResponseEntity.ok(
                authService.requestPasswordReset(request)
        );
    }

    @PostMapping("/password-reset/complete")
    public ResponseEntity<LogoutResponse> completePasswordReset(
            @Valid @RequestBody CompletePasswordResetRequest request
    ) {
        return ResponseEntity.ok(
                authService.completePasswordReset(request)
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
