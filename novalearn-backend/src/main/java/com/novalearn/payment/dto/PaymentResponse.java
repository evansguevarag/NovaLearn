package com.novalearn.payment.dto;

import com.novalearn.payment.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {

    private Long id;
    private Long studentId;
    private String studentEmail;
    private Long courseId;
    private String courseTitle;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String provider;
    private String providerPaymentId;
    private LocalDateTime createdAt;

    public PaymentResponse(Payment payment) {
        this.id = payment.getId();
        this.studentId = payment.getStudent().getId();
        this.studentEmail = payment.getStudent().getEmail();
        this.courseId = payment.getCourse().getId();
        this.courseTitle = payment.getCourse().getTitle();
        this.amount = payment.getAmount();
        this.currency = payment.getCurrency();
        this.status = payment.getStatus().name();
        this.provider = payment.getProvider().name();
        this.providerPaymentId = payment.getProviderPaymentId();
        this.createdAt = payment.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public String getStatus() {
        return status;
    }

    public String getProvider() {
        return provider;
    }

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}