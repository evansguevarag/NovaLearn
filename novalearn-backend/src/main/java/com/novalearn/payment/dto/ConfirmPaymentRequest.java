package com.novalearn.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ConfirmPaymentRequest {

    @NotNull(message = "El pago es obligatorio")
    private Long paymentId;

    @NotBlank(message = "El codigo del proveedor es obligatorio")
    private String providerPaymentId;

    private Boolean success;

    public Long getPaymentId() {
        return paymentId;
    }

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public Boolean getSuccess() {
        return success;
    }
}