package com.novalearn.payment.dto;

import com.novalearn.payment.entity.PaymentTransaction;

import java.time.LocalDateTime;

public class PaymentTransactionResponse {

    private Long id;
    private Long paymentId;
    private String transactionType;
    private String status;
    private String providerResponse;
    private LocalDateTime createdAt;

    public PaymentTransactionResponse(PaymentTransaction transaction) {
        this.id = transaction.getId();
        this.paymentId = transaction.getPayment().getId();
        this.transactionType = transaction.getTransactionType().name();
        this.status = transaction.getStatus().name();
        this.providerResponse = transaction.getProviderResponse();
        this.createdAt = transaction.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public String getStatus() {
        return status;
    }

    public String getProviderResponse() {
        return providerResponse;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}