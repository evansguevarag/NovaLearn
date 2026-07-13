package com.novalearn.core.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerifyLoginOtpRequest {

    @NotBlank(message = "El desafio de acceso es obligatorio")
    private String challengeId;

    @NotBlank(message = "El codigo OTP es obligatorio")
    @Pattern(
            regexp = "^\\d{6}$",
            message = "El codigo OTP debe tener 6 digitos"
    )
    private String code;

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
}
