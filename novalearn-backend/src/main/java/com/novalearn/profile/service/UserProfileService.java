package com.novalearn.profile.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.repository.UserRepository;
import com.novalearn.profile.dto.ChangePasswordRequest;
import com.novalearn.profile.dto.ProfileMessageResponse;
import com.novalearn.profile.dto.UpdateProfileRequest;
import com.novalearn.profile.dto.UserProfileResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.novalearn.audit.enums.AuditAction;
import com.novalearn.audit.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserProfileService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(User user) {
        return new UserProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(User authenticatedUser, UpdateProfileRequest request) {

        User user = userRepository.findById(authenticatedUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());

        return new UserProfileResponse(user);
    }

    @Transactional
    public ProfileMessageResponse changePassword(
        User authenticatedUser,
        ChangePasswordRequest request,
        HttpServletRequest httpRequest
) {

        User user = userRepository.findById(authenticatedUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("La nueva contraseña y la confirmacion no coinciden");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("La nueva contraseña no puede ser igual a la actual");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        auditLogService.register(
                user,
                AuditAction.PASSWORD_CHANGED,
                "User",
                user.getId().toString(),
                "Contraseña actualizada",
                httpRequest
        );

        return new ProfileMessageResponse("Contraseña actualizada correctamente");
    }
}