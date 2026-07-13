package com.novalearn.core.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CompletePasswordResetRequest {

    @NotBlank(message = "El desafio de recuperación es obligatorio")
    private String challengeId;

    @NotBlank(message = "El codigo es obligatorio")
    @Pattern(
            regexp = "^\\d{6}$",
            message = "El codigo debe tener 6 digitos"
    )
    private String code;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(
            min = 8,
            message = "La nueva contraseña debe tener mínimo 8 caracteres"
    )
    private String newPassword;

    public String getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
