package com.novalearn.payment.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCulqiChargeRequest {

    @NotBlank(message = "El token de Culqi es obligatorio")
    private String sourceId;

    public String getSourceId() {
        return sourceId;
    }
}
