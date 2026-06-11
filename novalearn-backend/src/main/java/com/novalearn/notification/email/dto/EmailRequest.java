package com.novalearn.notification.email.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class EmailRequest {

    @Email(message = "El correo destino no tiene formato valido")
    @NotBlank(message = "El correo destino es obligatorio")
    private String to;

    @NotBlank(message = "El asunto es obligatorio")
    private String subject;

    @NotBlank(message = "El contenido HTML es obligatorio")
    private String html;

    public String getTo() {
        return to;
    }

    public String getSubject() {
        return subject;
    }

    public String getHtml() {
        return html;
    }
}