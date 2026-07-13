package com.novalearn.student.dashboard.dto;

import com.novalearn.payment.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StudentPaymentDashboardResponse {

    private Long id;
    private Long courseId;
    private String courseTitle;
    private BigDecimal amount;
    private BigDecimal subtotalAmount;
    private BigDecimal processingFeeAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String currency;
    private String status;
    private String provider;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    public StudentPaymentDashboardResponse(Payment payment) {
        this.id = payment.getId();
        this.courseId = payment.getCourse().getId();
        this.courseTitle = payment.getCourse().getTitle();
        this.amount = payment.getAmount();
        this.subtotalAmount = payment.getSubtotalAmount();
        this.processingFeeAmount = payment.getProcessingFeeAmount();
        this.taxAmount = payment.getTaxAmount();
        this.totalAmount = payment.getTotalAmount();
        this.currency = payment.getCurrency();
        this.status = payment.getStatus().name();
        this.provider = payment.getProvider().name();
        this.createdAt = payment.getCreatedAt();
        this.paidAt = payment.getPaidAt();
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

    public BigDecimal getSubtotalAmount() {
        return subtotalAmount;
    }

    public BigDecimal getProcessingFeeAmount() {
        return processingFeeAmount;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
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

    public LocalDateTime getPaidAt() {
        return paidAt;
    }
}
