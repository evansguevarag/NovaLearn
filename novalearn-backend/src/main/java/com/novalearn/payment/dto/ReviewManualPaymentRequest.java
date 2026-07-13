package com.novalearn.payment.dto;

import jakarta.validation.constraints.Size;

public class ReviewManualPaymentRequest {

    @Size(max = 500, message = "El motivo no debe superar 500 caracteres")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
