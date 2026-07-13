package com.novalearn.core.account.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateAccountProfileRequest {

    @NotBlank(message = "Los nombres son obligatorios")
    @Size(max = 100, message = "Los nombres no deben superar 100 caracteres")
    private String firstName;

    @NotBlank(message = "El apellido paterno es obligatorio")
    @Size(max = 100, message = "El apellido paterno no debe superar 100 caracteres")
    private String paternalLastName;

    @NotBlank(message = "El apellido materno es obligatorio")
    @Size(max = 100, message = "El apellido materno no debe superar 100 caracteres")
    private String maternalLastName;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El correo electrónico no tiene un formato válido")
    @Size(max = 255, message = "El correo electrónico no debe superar 255 caracteres")
    private String email;

    public String getFirstName() {
        return firstName;
    }

    public String getPaternalLastName() {
        return paternalLastName;
    }

    public String getMaternalLastName() {
        return maternalLastName;
    }

    public String getEmail() {
        return email;
    }
}
