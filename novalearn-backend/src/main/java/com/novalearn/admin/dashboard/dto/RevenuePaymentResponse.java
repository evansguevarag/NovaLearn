package com.novalearn.admin.dashboard.dto;

import com.novalearn.payment.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RevenuePaymentResponse {

    private Long paymentId;
    private Long courseId;
    private String courseTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private BigDecimal amount;
    private BigDecimal subtotalAmount;
    private BigDecimal processingFeeAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String currency;
    private LocalDateTime paidAt;

    public RevenuePaymentResponse(Payment payment) {
        this.paymentId = payment.getId();
        this.courseId = payment.getCourse().getId();
        this.courseTitle = payment.getCourse().getTitle();
        this.studentId = payment.getStudent().getId();
        this.studentName = buildStudentName(payment);
        this.studentEmail = payment.getStudent().getEmail();
        this.amount = payment.getAmount();
        this.subtotalAmount = payment.getSubtotalAmount();
        this.processingFeeAmount = payment.getProcessingFeeAmount();
        this.taxAmount = payment.getTaxAmount();
        this.totalAmount = payment.getTotalAmount();
        this.currency = payment.getCurrency();
        this.paidAt = payment.getPaidAt() != null
                ? payment.getPaidAt()
                : payment.getUpdatedAt();
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
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

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    private String buildStudentName(Payment payment) {
        String firstName = payment.getStudent().getFirstName();
        String lastName = payment.getStudent().getLastName();
        String fullName = ((firstName != null ? firstName : "") + " " +
                (lastName != null ? lastName : "")).trim();

        return fullName.isBlank()
                ? payment.getStudent().getEmail()
                : fullName;
    }
}
