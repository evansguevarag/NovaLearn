package com.novalearn.core.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ConfirmEmailChangeRequest {

    @NotBlank(message = "El identificador del cambio es obligatorio")
    private String challengeId;

    @NotBlank(message = "El código OTP es obligatorio")
    @Pattern(regexp = "\\d{6}", message = "El código OTP debe tener 6 dígitos")
    private String code;

    public String getChallengeId() {
        return challengeId;
    }

    public String getCode() {
        return code;
    }
}
