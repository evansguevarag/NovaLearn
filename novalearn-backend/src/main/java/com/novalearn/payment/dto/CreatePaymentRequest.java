package com.novalearn.payment.dto;

import jakarta.validation.constraints.NotNull;

public class CreatePaymentRequest {

    @NotNull(message = "El curso es obligatorio")
    private Long courseId;

    public Long getCourseId() {
        return courseId;
    }
}