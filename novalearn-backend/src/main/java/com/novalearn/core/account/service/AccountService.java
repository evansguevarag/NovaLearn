package com.novalearn.core.account.service;

import com.novalearn.core.account.dto.AccountProfileResponse;
import com.novalearn.core.account.dto.ChangePasswordRequest;
import com.novalearn.core.account.dto.ConfirmEmailChangeRequest;
import com.novalearn.core.account.dto.ConfirmEmailChangeResponse;
import com.novalearn.core.account.dto.EmailChangeChallengeResponse;
import com.novalearn.core.account.dto.RequestEmailChangeRequest;
import com.novalearn.core.account.dto.UpdateAccountProfileRequest;
import com.novalearn.core.account.entity.AccountEmailChangeOtpChallenge;
import com.novalearn.core.account.repository.AccountEmailChangeOtpChallengeRepository;
import com.novalearn.core.auth.dto.AuthResponse;
import com.novalearn.core.auth.jwt.JwtService;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.repository.UserRepository;
import com.novalearn.notification.email.service.EmailService;
import com.novalearn.notification.email.service.EmailTemplateService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AccountService {

    private static final Duration EMAIL_CHANGE_TTL =
            Duration.ofMinutes(10);
    private static final SecureRandom SECURE_RANDOM =
            new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountEmailChangeOtpChallengeRepository
            emailChangeOtpChallengeRepository;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    public AccountService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AccountEmailChangeOtpChallengeRepository
                    emailChangeOtpChallengeRepository,
            JwtService jwtService,
            EmailService emailService,
            EmailTemplateService emailTemplateService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailChangeOtpChallengeRepository =
                emailChangeOtpChallengeRepository;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.emailTemplateService = emailTemplateService;
    }

    @Transactional(readOnly = true)
    public AccountProfileResponse getProfile(User user) {
        return new AccountProfileResponse(user);
    }

    @Transactional
    public AccountProfileResponse updateProfile(
            User user,
            UpdateAccountProfileRequest request
    ) {
        return new AccountProfileResponse(user);
    }

    @Transactional
    public EmailChangeChallengeResponse requestEmailChange(
            User user,
            RequestEmailChangeRequest request
    ) {
        String newEmail = normalizeEmail(request.getEmail());

        if (user.getEmail().equalsIgnoreCase(newEmail)) {
            throw new IllegalArgumentException(
                    "Ingresa un correo diferente al actual"
            );
        }

        if (userRepository.existsByEmailIgnoreCase(newEmail)) {
            throw new IllegalArgumentException(
                    "El correo electrónico ya está en uso"
            );
        }

        expireActiveEmailChangeOtps(user);

        String code = generateOtpCode();
        LocalDateTime expiresAt =
                LocalDateTime.now().plus(EMAIL_CHANGE_TTL);
        AccountEmailChangeOtpChallenge challenge =
                new AccountEmailChangeOtpChallenge(
                        UUID.randomUUID().toString(),
                        user,
                        newEmail,
                        passwordEncoder.encode(code),
                        expiresAt
                );

        emailChangeOtpChallengeRepository.save(challenge);

        emailService.sendEmail(
                newEmail,
                emailTemplateService.emailChangeSubject(),
                emailTemplateService.emailChangeHtml(
                        user,
                        code,
                        EMAIL_CHANGE_TTL.toMinutes()
                )
        );

        return new EmailChangeChallengeResponse(
                challenge.getChallengeId(),
                maskEmail(newEmail),
                expiresAt,
                EMAIL_CHANGE_TTL.toSeconds()
        );
    }

    @Transactional
    public ConfirmEmailChangeResponse confirmEmailChange(
            User authenticatedUser,
            ConfirmEmailChangeRequest request
    ) {
        AccountEmailChangeOtpChallenge challenge =
                emailChangeOtpChallengeRepository
                        .findByChallengeId(request.getChallengeId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "El código de verificación no es válido"
                                )
                        );

        LocalDateTime now = LocalDateTime.now();

        if (!challenge.getUser().getId().equals(authenticatedUser.getId())
                || !challenge.isUsable(now)) {
            throw new IllegalArgumentException(
                    "El código de verificación expiró o ya fue utilizado"
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
                    "El código de verificación no es válido"
            );
        }

        String newEmail = challenge.getNewEmail();

        if (userRepository.existsByEmailIgnoreCase(newEmail)) {
            throw new IllegalArgumentException(
                    "El correo electrónico ya está en uso"
            );
        }

        User user = challenge.getUser();
        user.setEmail(newEmail);
        user.setEmailVerified(false);
        challenge.consume(now);
        User savedUser = userRepository.save(user);

        AuthResponse auth = new AuthResponse(
                jwtService.generateAccessToken(savedUser.getEmail()),
                savedUser.getId(),
                savedUser.getFirstName(),
                savedUser.getPaternalLastName(),
                savedUser.getMaternalLastName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getStatus().name()
        );

        return new ConfirmEmailChangeResponse(
                new AccountProfileResponse(savedUser),
                auth
        );
    }

    @Transactional
    public void changePassword(
            User user,
            ChangePasswordRequest request
    ) {
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "La contraseña actual no es correcta"
            );
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);
    }

    private String normalizeEmail(String value) {
        return value.trim().toLowerCase();
    }

    private void expireActiveEmailChangeOtps(User user) {
        LocalDateTime now = LocalDateTime.now();

        emailChangeOtpChallengeRepository
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
