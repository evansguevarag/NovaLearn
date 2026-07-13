package com.novalearn.payment.dto;

import com.novalearn.payment.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {

    private Long id;
    private Long studentId;
    private String studentEmail;
    private String studentFullName;
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
    private String providerPaymentId;
    private String providerOrderId;
    private String providerOrderStatus;
    private LocalDateTime providerOrderExpiresAt;
    private String manualMethod;
    private String manualReference;
    private String manualProofUrl;
    private String manualProofResourceType;
    private Long manualReviewedById;
    private String manualReviewedByEmail;
    private LocalDateTime manualReviewedAt;
    private String manualRejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    public PaymentResponse(Payment payment) {
        this.id = payment.getId();
        this.studentId = payment.getStudent().getId();
        this.studentEmail = payment.getStudent().getEmail();
        this.studentFullName = buildStudentFullName(payment);
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
        this.providerPaymentId = payment.getProviderPaymentId();
        this.providerOrderId = payment.getProviderOrderId();
        this.providerOrderStatus = payment.getProviderOrderStatus();
        this.providerOrderExpiresAt = payment.getProviderOrderExpiresAt();
        this.manualMethod = payment.getManualMethod();
        this.manualReference = payment.getManualReference();
        this.manualProofUrl = payment.getManualProofUrl();
        this.manualProofResourceType = payment.getManualProofResourceType();
        this.manualReviewedById = payment.getManualReviewedBy() != null
                ? payment.getManualReviewedBy().getId()
                : null;
        this.manualReviewedByEmail = payment.getManualReviewedBy() != null
                ? payment.getManualReviewedBy().getEmail()
                : null;
        this.manualReviewedAt = payment.getManualReviewedAt();
        this.manualRejectionReason = payment.getManualRejectionReason();
        this.createdAt = payment.getCreatedAt();
        this.paidAt = payment.getPaidAt();
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

    public String getStudentFullName() {
        return studentFullName;
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

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public String getProviderOrderId() {
        return providerOrderId;
    }

    public String getProviderOrderStatus() {
        return providerOrderStatus;
    }

    public LocalDateTime getProviderOrderExpiresAt() {
        return providerOrderExpiresAt;
    }

    public String getManualMethod() {
        return manualMethod;
    }

    public String getManualReference() {
        return manualReference;
    }

    public String getManualProofUrl() {
        return manualProofUrl;
    }

    public String getManualProofResourceType() {
        return manualProofResourceType;
    }

    public Long getManualReviewedById() {
        return manualReviewedById;
    }

    public String getManualReviewedByEmail() {
        return manualReviewedByEmail;
    }

    public LocalDateTime getManualReviewedAt() {
        return manualReviewedAt;
    }

    public String getManualRejectionReason() {
        return manualRejectionReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    private String buildStudentFullName(Payment payment) {
        String firstName = normalize(payment.getStudent().getFirstName());
        String lastName = normalize(payment.getStudent().getLastName());

        String fullName = (firstName + " " + lastName).trim();

        return fullName.isBlank()
                ? payment.getStudent().getEmail()
                : fullName;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
