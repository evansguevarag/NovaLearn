package com.novalearn.core.auth.service;

import com.novalearn.core.auth.dto.AuthResponse;
import com.novalearn.core.auth.dto.LoginRequest;
import com.novalearn.core.auth.dto.RegisterRequest;
import com.novalearn.core.auth.jwt.JwtService;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.core.user.enums.UserStatus;
import com.novalearn.core.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.novalearn.core.token.entity.RefreshToken;
import com.novalearn.core.token.service.RefreshTokenService;
import com.novalearn.core.auth.dto.RefreshTokenRequest;
import com.novalearn.notification.email.service.EmailService;
import com.novalearn.notification.email.service.EmailTemplateService;

@Service
public class AuthService {
        private final RefreshTokenService refreshTokenService;    
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final EmailService emailService;
        private final EmailTemplateService emailTemplateService;

        public AuthService(
                UserRepository userRepository,
                PasswordEncoder passwordEncoder,
                JwtService jwtService,
                RefreshTokenService refreshTokenService,
                EmailService emailService,
                EmailTemplateService emailTemplateService
        ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.emailService = emailService;
        this.emailTemplateService = emailTemplateService;
        }

        @Transactional
        public AuthResponse register(RegisterRequest request) {

                String email = request.getEmail().trim().toLowerCase();

                if (userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("El correo ya está registrado");
        }

        User user = new User();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.STUDENT);
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(savedUser.getEmail());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);

        try {
        emailService.sendEmail(
                savedUser.getEmail(),
                emailTemplateService.welcomeSubject(),
                emailTemplateService.welcomeHtml(savedUser)
        );
        } catch (Exception ignored) {
        }

        return new AuthResponse(
        accessToken,
        refreshToken.getToken(),
        savedUser.getId(),
        savedUser.getEmail(),
        savedUser.getRole().name(),
        savedUser.getStatus().name()
        );
        
        }

        @Transactional
        public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Credenciales inválidas")
                );

        boolean validPassword =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!validPassword) {
                throw new IllegalArgumentException("Credenciales inválidas");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail());

                RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                user.getStatus().name()
        );
        }

        @Transactional
        public AuthResponse refreshToken(RefreshTokenRequest request) {

        RefreshToken currentRefreshToken =
                refreshTokenService.validateRefreshToken(
                        request.getRefreshToken()
                );

        User user = currentRefreshToken.getUser();

        currentRefreshToken.revoke();

        String accessToken = jwtService.generateAccessToken(user.getEmail());

        RefreshToken newRefreshToken =
                refreshTokenService.createRefreshToken(user);

        return new AuthResponse(
                accessToken,
                newRefreshToken.getToken(),
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                user.getStatus().name()
        );
        }

        @Transactional
        public void logout(RefreshTokenRequest request) {
        refreshTokenService.revokeRefreshToken(
                request.getRefreshToken()
        );
        }
}