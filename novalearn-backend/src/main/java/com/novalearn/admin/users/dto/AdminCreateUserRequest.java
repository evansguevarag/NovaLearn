package com.novalearn.admin.users.dto;

import com.novalearn.core.user.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AdminCreateUserRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no debe superar 100 caracteres")
    private String firstName;

    @Size(max = 100, message = "El apellido no debe superar 100 caracteres")
    private String lastName;

    @NotBlank(message = "El apellido paterno es obligatorio")
    @Size(max = 100, message = "El apellido paterno no debe superar 100 caracteres")
    private String paternalLastName;

    @NotBlank(message = "El apellido materno es obligatorio")
    @Size(max = 100, message = "El apellido materno no debe superar 100 caracteres")
    private String maternalLastName;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato valido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener minimo 8 caracteres")
    private String password;

    @NotNull(message = "El rol es obligatorio")
    private UserRole role;

    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getPaternalLastName() { return paternalLastName; }
    public String getMaternalLastName() { return maternalLastName; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public UserRole getRole() { return role; }
}
