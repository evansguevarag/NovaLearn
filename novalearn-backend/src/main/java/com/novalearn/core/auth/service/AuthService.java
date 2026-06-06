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

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

        return new AuthResponse(
                accessToken,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getStatus().name()
        );
    }

    @Transactional(readOnly = true)
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

    String accessToken =
            jwtService.generateAccessToken(user.getEmail());

    return new AuthResponse(
            accessToken,
            user.getId(),
            user.getEmail(),
            user.getRole().name(),
            user.getStatus().name()
    );
    }
}