package com.novalearn.admin.users.dto;

import com.novalearn.core.user.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public class AdminUpdateUserStatusRequest {

    @NotNull(message = "El estado es obligatorio")
    private UserStatus status;

    public UserStatus getStatus() {
        return status;
    }
}