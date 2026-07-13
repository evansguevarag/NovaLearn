package com.novalearn.admin.users.service;

import com.novalearn.admin.users.dto.AdminCreateUserRequest;
import com.novalearn.admin.users.dto.AdminEmailAvailabilityResponse;
import com.novalearn.admin.users.dto.AdminUpdateUserRoleRequest;
import com.novalearn.admin.users.dto.AdminUpdateUserStatusRequest;
import com.novalearn.admin.users.dto.AdminUserResponse;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserStatus;
import com.novalearn.core.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUserManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserManagementService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> findAll() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(AdminUserResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminUserResponse findById(Long userId) {
        User user = findUserOrThrow(userId);
        return new AdminUserResponse(user);
    }

    @Transactional(readOnly = true)
    public AdminEmailAvailabilityResponse checkEmailAvailability(
            String email
    ) {
        String normalizedEmail = normalizeEmail(email);

        return new AdminEmailAvailabilityResponse(
                normalizedEmail,
                !userRepository.existsByEmail(normalizedEmail)
        );
    }

    @Transactional
    public AdminUserResponse create(AdminCreateUserRequest request) {

        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Ya existe un usuario registrado con ese correo");
        }

        User user = new User();
        user.setFirstName(normalizeName(request.getFirstName()));
        user.setPaternalLastName(
                normalizeName(request.getPaternalLastName())
        );
        user.setMaternalLastName(
                normalizeName(request.getMaternalLastName())
        );
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);

        User savedUser = userRepository.save(user);

        return new AdminUserResponse(savedUser);
    }

    @Transactional
    public AdminUserResponse updateRole(Long userId, AdminUpdateUserRoleRequest request) {

        User user = findUserOrThrow(userId);

        user.setRole(request.getRole());

        return new AdminUserResponse(user);
    }

    @Transactional
    public AdminUserResponse updateStatus(Long userId, AdminUpdateUserStatusRequest request) {

        User user = findUserOrThrow(userId);

        user.setStatus(request.getStatus());

        return new AdminUserResponse(user);
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private String normalizeName(String value) {
        if (value == null) {
            return "";
        }

        return value.trim().replaceAll("\\s+", " ");
    }

    private String normalizeEmail(String value) {
        if (value == null || value.trim().isBlank()) {
            throw new IllegalArgumentException("El correo es obligatorio");
        }

        return value.trim().toLowerCase();
    }
}
