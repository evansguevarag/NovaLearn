package com.novalearn.student.dashboard.dto;

import com.novalearn.payment.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StudentPaymentDashboardResponse {

    private Long id;
    private Long courseId;
    private String courseTitle;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String provider;
    private LocalDateTime createdAt;

    public StudentPaymentDashboardResponse(Payment payment) {
        this.id = payment.getId();
        this.courseId = payment.getCourse().getId();
        this.courseTitle = payment.getCourse().getTitle();
        this.amount = payment.getAmount();
        this.currency = payment.getCurrency();
        this.status = payment.getStatus().name();
        this.provider = payment.getProvider().name();
        this.createdAt = payment.getCreatedAt();
    }

    public Long getId() {
        return id;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}