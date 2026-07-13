package com.novalearn.core.auth.service;

import com.novalearn.core.auth.dto.AuthResponse;
import com.novalearn.core.auth.dto.AuthSessionResult;
import com.novalearn.core.auth.dto.CompletePasswordResetRequest;
import com.novalearn.core.auth.dto.EmailAvailabilityResponse;
import com.novalearn.core.auth.dto.LoginOtpChallengeResponse;
import com.novalearn.core.auth.dto.LoginRequest;
import com.novalearn.core.auth.dto.LoginResponse;
import com.novalearn.core.auth.dto.LoginResult;
import com.novalearn.core.auth.dto.LogoutResponse;
import com.novalearn.core.auth.dto.PasswordResetChallengeResponse;
import com.novalearn.core.auth.dto.PasswordResetRequest;
import com.novalearn.core.auth.dto.RegisterRequest;
import com.novalearn.core.auth.dto.VerifyLoginOtpRequest;
import com.novalearn.core.auth.entity.LoginOtpChallenge;
import com.novalearn.core.auth.entity.PasswordResetOtpChallenge;
import com.novalearn.core.auth.jwt.JwtService;
import com.novalearn.core.auth.repository.LoginOtpChallengeRepository;
import com.novalearn.core.auth.repository.PasswordResetOtpChallengeRepository;
import com.novalearn.core.token.entity.RefreshToken;
import com.novalearn.core.token.service.RefreshTokenService;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.core.user.enums.UserStatus;
import com.novalearn.core.user.repository.UserRepository;
import com.novalearn.notification.email.service.EmailService;
import com.novalearn.notification.email.service.EmailTemplateService;
import com.novalearn.notification.internal.enums.NotificationType;
import com.novalearn.notification.internal.service.UserNotificationService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final Duration LOGIN_OTP_TTL =
            Duration.ofMinutes(5);
    private static final Duration PASSWORD_RESET_TTL =
            Duration.ofMinutes(10);
    private static final SecureRandom SECURE_RANDOM =
            new SecureRandom();

    private final RefreshTokenService refreshTokenService;
    private final LoginOtpChallengeRepository loginOtpChallengeRepository;
    private final PasswordResetOtpChallengeRepository passwordResetOtpChallengeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final UserNotificationService userNotificationService;
    private final boolean loginOtpEnabled;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            LoginOtpChallengeRepository loginOtpChallengeRepository,
            PasswordResetOtpChallengeRepository passwordResetOtpChallengeRepository,
            EmailService emailService,
            EmailTemplateService emailTemplateService,
            UserNotificationService userNotificationService,
            @Value("${app.security.login-otp-enabled:false}")
            boolean loginOtpEnabled
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.loginOtpChallengeRepository = loginOtpChallengeRepository;
        this.passwordResetOtpChallengeRepository =
                passwordResetOtpChallengeRepository;
        this.emailService = emailService;
        this.emailTemplateService = emailTemplateService;
        this.userNotificationService = userNotificationService;
        this.loginOtpEnabled = loginOtpEnabled;
    }

    @Transactional
    public AuthSessionResult register(
            RegisterRequest request
    ) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "El correo ya está registrado"
            );
        }

        User user = new User();
        user.setFirstName(normalizeName(request.getFirstName()));
        user.setPaternalLastName(
                normalizeName(request.getPaternalLastName())
        );
        user.setMaternalLastName(
                normalizeName(request.getMaternalLastName())
        );
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );
        user.setRole(UserRole.STUDENT);
        user.setStatus(
                UserStatus.ACTIVE
        );
        user.setEmailVerified(false);

        User savedUser =
                userRepository.save(user);

        userNotificationService
                .createSystemNotification(
                        savedUser,
                        "Bienvenido a NovaLearn",
                        "Tu cuenta fue creada correctamente. Ya puedes explorar cursos.",
                        NotificationType.SYSTEM
                );

        AuthSessionResult session =
                createSession(savedUser);

        try {
            emailService.sendEmail(
                    savedUser.getEmail(),
                    emailTemplateService
                            .welcomeSubject(),
                    emailTemplateService
                            .welcomeHtml(savedUser)
            );
        } catch (Exception ignored) {
            // El registro no debe fallar si el correo no puede enviarse.
        }

        return session;
    }

    @Transactional
    public PasswordResetChallengeResponse requestPasswordReset(
            PasswordResetRequest request
    ) {
        String email = normalizeEmail(request.getEmail());
        LocalDateTime expiresAt =
                LocalDateTime.now().plus(PASSWORD_RESET_TTL);

        return userRepository
                .findByEmail(email)
                .map(user -> createPasswordResetChallenge(user, expiresAt))
                .orElseGet(() ->
                        new PasswordResetChallengeResponse(
                                "",
                                maskEmail(email),
                                expiresAt,
                                PASSWORD_RESET_TTL.toSeconds()
                        )
                );
    }

    @Transactional
    public LogoutResponse completePasswordReset(
            CompletePasswordResetRequest request
    ) {
        PasswordResetOtpChallenge challenge =
                passwordResetOtpChallengeRepository
                        .findByChallengeId(
                                request.getChallengeId()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "El codigo de recuperación no es valido"
                                )
                        );

        LocalDateTime now = LocalDateTime.now();

        if (!challenge.isUsable(now)) {
            throw new IllegalArgumentException(
                    "El codigo de recuperación expiro o ya fue utilizado"
            );
        }

        boolean validCode =
                passwordEncoder.matches(
                        request.getCode(),
                        challenge.getCodeHash()
                );

        if (!validCode) {
            challenge.registerFailedAttempt();
            throw new IllegalArgumentException(
                    "El codigo de recuperación no es valido"
            );
        }

        User user = challenge.getUser();

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalArgumentException(
                    "La cuenta está inactiva"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );
        challenge.consume(now);
        refreshTokenService.revokeAllRefreshTokensForUser(user);

        return new LogoutResponse(
                "Contraseña actualizada correctamente"
        );
    }

    @Transactional
    public LoginResult login(
            LoginRequest request
    ) {
        String email = normalizeEmail(request.getEmail());

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Credenciales inválidas"
                        )
                );

        boolean validPassword =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!validPassword) {
            throw new IllegalArgumentException(
                    "Credenciales inválidas"
            );
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalArgumentException(
                    "La cuenta está inactiva"
            );
        }

        if (!loginOtpEnabled) {
            AuthSessionResult session = createSession(user);

            return new LoginResult(
                    LoginResponse.authenticated(
                            session.response()
                    ),
                    session.refreshToken()
            );
        }

        expireActiveLoginOtps(user);

        String code = generateOtpCode();
        LocalDateTime expiresAt =
                LocalDateTime.now().plus(LOGIN_OTP_TTL);
        LoginOtpChallenge challenge =
                new LoginOtpChallenge(
                        UUID.randomUUID().toString(),
                        user,
                        passwordEncoder.encode(code),
                        expiresAt
                );

        loginOtpChallengeRepository.save(challenge);

        emailService.sendEmail(
                user.getEmail(),
                emailTemplateService.loginOtpSubject(),
                emailTemplateService.loginOtpHtml(
                        user,
                        code,
                        LOGIN_OTP_TTL.toMinutes()
                )
        );

        return new LoginResult(
                LoginResponse.withOtp(
                        new LoginOtpChallengeResponse(
                                challenge.getChallengeId(),
                                maskEmail(user.getEmail()),
                                expiresAt,
                                LOGIN_OTP_TTL.toSeconds()
                        )
                ),
                null
        );
    }

    @Transactional
    public AuthSessionResult verifyLoginOtp(
            VerifyLoginOtpRequest request
    ) {
        LoginOtpChallenge challenge =
                loginOtpChallengeRepository
                        .findByChallengeId(
                                request.getChallengeId()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "El codigo de acceso no es valido"
                                )
                        );

        LocalDateTime now = LocalDateTime.now();

        if (!challenge.isUsable(now)) {
            throw new IllegalArgumentException(
                    "El codigo de acceso expiro o ya fue utilizado"
            );
        }

        boolean validCode =
                passwordEncoder.matches(
                        request.getCode(),
                        challenge.getCodeHash()
                );

        if (!validCode) {
            challenge.registerFailedAttempt();
            throw new IllegalArgumentException(
                    "El codigo de acceso no es valido"
            );
        }

        User user = challenge.getUser();

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalArgumentException(
                    "La cuenta está inactiva"
            );
        }

        challenge.consume(now);

        return createSession(user);
    }

    @Transactional
    public AuthSessionResult refreshToken(
            String refreshTokenValue
    ) {
        RefreshToken currentRefreshToken =
                refreshTokenService
                        .validateRefreshToken(
                                refreshTokenValue
                        );

        User user =
                currentRefreshToken.getUser();

        currentRefreshToken.revoke();

        return createSession(user);
    }

    @Transactional
    public void logout(
            String refreshTokenValue
    ) {
        refreshTokenService
                .revokeRefreshTokenIfPresent(
                        refreshTokenValue
                );
    }

    @Transactional(readOnly = true)
    public EmailAvailabilityResponse checkEmailAvailability(
            String email
    ) {
        String normalizedEmail = normalizeEmail(email);

        return new EmailAvailabilityResponse(
                normalizedEmail,
                !userRepository.existsByEmail(normalizedEmail)
        );
    }

    private AuthSessionResult createSession(
            User user
    ) {
        String accessToken =
                jwtService.generateAccessToken(
                        user.getEmail()
                );

        RefreshToken refreshToken =
                refreshTokenService
                        .createRefreshToken(user);

        AuthResponse response =
                new AuthResponse(
                        accessToken,
                        user.getId(),
                        user.getFirstName(),
                        user.getPaternalLastName(),
                        user.getMaternalLastName(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.getStatus().name()
                );

        return new AuthSessionResult(
                response,
                refreshToken.getToken()
        );
    }

    private String normalizeName(String value) {
        if (value == null) {
            return "";
        }

        return value.trim().replaceAll("\\s+", " ");
    }

    private String normalizeEmail(String value) {
        if (value == null || value.trim().isBlank()) {
            throw new IllegalArgumentException(
                    "El correo es obligatorio"
            );
        }

        return value.trim().toLowerCase();
    }

    private void expireActiveLoginOtps(User user) {
        LocalDateTime now = LocalDateTime.now();

        loginOtpChallengeRepository
                .findByUserAndConsumedAtIsNull(user)
                .forEach(challenge -> challenge.expire(now));
    }

    private PasswordResetChallengeResponse createPasswordResetChallenge(
            User user,
            LocalDateTime expiresAt
    ) {
        expireActivePasswordResetOtps(user);

        String code = generateOtpCode();
        PasswordResetOtpChallenge challenge =
                new PasswordResetOtpChallenge(
                        UUID.randomUUID().toString(),
                        user,
                        passwordEncoder.encode(code),
                        expiresAt
                );

        passwordResetOtpChallengeRepository.save(challenge);

        emailService.sendEmail(
                user.getEmail(),
                emailTemplateService.passwordResetSubject(),
                emailTemplateService.passwordResetHtml(
                        user,
                        code,
                        PASSWORD_RESET_TTL.toMinutes()
                )
        );

        return new PasswordResetChallengeResponse(
                challenge.getChallengeId(),
                maskEmail(user.getEmail()),
                expiresAt,
                PASSWORD_RESET_TTL.toSeconds()
        );
    }

    private void expireActivePasswordResetOtps(User user) {
        LocalDateTime now = LocalDateTime.now();

        passwordResetOtpChallengeRepository
                .findByUserAndConsumedAtIsNull(user)
                .forEach(challenge -> challenge.expire(now));
    }

    private String generateOtpCode() {
        int code = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", code);
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf("@");

        if (atIndex <= 1) {
            return email;
        }

        String prefix = email.substring(0, Math.min(2, atIndex));
        String domain = email.substring(atIndex);

        return prefix + "***" + domain;
    }
}
