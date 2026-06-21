package com.novalearn.admin.users.service;

import com.novalearn.admin.users.dto.AdminCreateUserRequest;
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

    @Transactional
    public AdminUserResponse create(AdminCreateUserRequest request) {

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Ya existe un usuario registrado con ese correo");
        }

        User user = new User();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
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
}