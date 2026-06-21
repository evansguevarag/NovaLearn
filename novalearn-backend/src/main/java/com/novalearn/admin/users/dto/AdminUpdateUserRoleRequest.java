package com.novalearn.admin.users.dto;

import com.novalearn.core.user.enums.UserRole;
import jakarta.validation.constraints.NotNull;

public class AdminUpdateUserRoleRequest {

    @NotNull(message = "El rol es obligatorio")
    private UserRole role;

    public UserRole getRole() {
        return role;
    }
}