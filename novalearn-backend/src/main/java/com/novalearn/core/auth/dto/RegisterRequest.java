package com.novalearn.core.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String firstName;

    @NotBlank(message = "El apellido paterno es obligatorio")
    private String paternalLastName;

    @NotBlank(message = "El apellido materno es obligatorio")
    private String maternalLastName;

    private String lastName;

    @Email(message = "El correo no tiene un formato válido")
    @NotBlank(message = "El correo es obligatorio")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    public String getFirstName() {
        return firstName;
    }

    public String getPaternalLastName() {
        return paternalLastName;
    }

    public String getMaternalLastName() {
        return maternalLastName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}
