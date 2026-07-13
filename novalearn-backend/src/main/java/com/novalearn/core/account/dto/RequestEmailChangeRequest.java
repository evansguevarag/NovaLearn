package com.novalearn.core.account.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RequestEmailChangeRequest {

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El correo electrónico no tiene un formato válido")
    @Size(max = 255, message = "El correo electrónico no debe superar 255 caracteres")
    private String email;

    public String getEmail() {
        return email;
    }
}
