package com.novalearn.payment.entity;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.payment.enums.PaymentProvider;
import com.novalearn.payment.enums.PaymentStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "payments",
        indexes = {
                @Index(name = "idx_payments_student", columnList = "student_id"),
                @Index(name = "idx_payments_course", columnList = "course_id"),
                @Index(name = "idx_payments_status", columnList = "status")
        }
)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "subtotal_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotalAmount = BigDecimal.ZERO;

    @Column(name = "processing_fee_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal processingFeeAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "PEN";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 50)
    private PaymentProvider provider = PaymentProvider.CULQI;

    @Column(name = "provider_payment_id", length = 255)
    private String providerPaymentId;

    @Column(name = "provider_order_id", length = 255)
    private String providerOrderId;

    @Column(name = "provider_order_status", length = 50)
    private String providerOrderStatus;

    @Column(name = "provider_order_expires_at")
    private LocalDateTime providerOrderExpiresAt;

    @Column(name = "manual_method", length = 50)
    private String manualMethod;

    @Column(name = "manual_reference", length = 150)
    private String manualReference;

    @Column(name = "manual_proof_url", length = 1000)
    private String manualProofUrl;

    @Column(name = "manual_proof_public_id", length = 500)
    private String manualProofPublicId;

    @Column(name = "manual_proof_resource_type", length = 50)
    private String manualProofResourceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manual_reviewed_by")
    private User manualReviewedBy;

    @Column(name = "manual_reviewed_at")
    private LocalDateTime manualReviewedAt;

    @Column(name = "manual_rejection_reason", length = 500)
    private String manualRejectionReason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (currency == null) {
            currency = "PEN";
        }

        if (status == null) {
            status = PaymentStatus.PENDING;
        }

        if (provider == null) {
            provider = PaymentProvider.CULQI;
        }

        if (subtotalAmount == null) {
            subtotalAmount = amount != null ? amount : BigDecimal.ZERO;
        }

        if (processingFeeAmount == null) {
            processingFeeAmount = BigDecimal.ZERO;
        }

        if (taxAmount == null) {
            taxAmount = BigDecimal.ZERO;
        }

        if (totalAmount == null) {
            totalAmount = amount != null ? amount : subtotalAmount;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getSubtotalAmount() {
        return subtotalAmount;
    }

    public void setSubtotalAmount(BigDecimal subtotalAmount) {
        this.subtotalAmount = subtotalAmount;
    }

    public BigDecimal getProcessingFeeAmount() {
        return processingFeeAmount;
    }

    public void setProcessingFeeAmount(BigDecimal processingFeeAmount) {
        this.processingFeeAmount = processingFeeAmount;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
        this.amount = totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public PaymentProvider getProvider() {
        return provider;
    }

    public void setProvider(PaymentProvider provider) {
        this.provider = provider;
    }

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public void setProviderPaymentId(String providerPaymentId) {
        this.providerPaymentId = providerPaymentId;
    }

    public String getProviderOrderId() {
        return providerOrderId;
    }

    public void setProviderOrderId(String providerOrderId) {
        this.providerOrderId = providerOrderId;
    }

    public String getProviderOrderStatus() {
        return providerOrderStatus;
    }

    public void setProviderOrderStatus(String providerOrderStatus) {
        this.providerOrderStatus = providerOrderStatus;
    }

    public LocalDateTime getProviderOrderExpiresAt() {
        return providerOrderExpiresAt;
    }

    public void setProviderOrderExpiresAt(
            LocalDateTime providerOrderExpiresAt
    ) {
        this.providerOrderExpiresAt = providerOrderExpiresAt;
    }

    public String getManualMethod() {
        return manualMethod;
    }

    public void setManualMethod(String manualMethod) {
        this.manualMethod = manualMethod;
    }

    public String getManualReference() {
        return manualReference;
    }

    public void setManualReference(String manualReference) {
        this.manualReference = manualReference;
    }

    public String getManualProofUrl() {
        return manualProofUrl;
    }

    public void setManualProofUrl(String manualProofUrl) {
        this.manualProofUrl = manualProofUrl;
    }

    public String getManualProofPublicId() {
        return manualProofPublicId;
    }

    public void setManualProofPublicId(String manualProofPublicId) {
        this.manualProofPublicId = manualProofPublicId;
    }

    public String getManualProofResourceType() {
        return manualProofResourceType;
    }

    public void setManualProofResourceType(String manualProofResourceType) {
        this.manualProofResourceType = manualProofResourceType;
    }

    public User getManualReviewedBy() {
        return manualReviewedBy;
    }

    public void setManualReviewedBy(User manualReviewedBy) {
        this.manualReviewedBy = manualReviewedBy;
    }

    public LocalDateTime getManualReviewedAt() {
        return manualReviewedAt;
    }

    public void setManualReviewedAt(LocalDateTime manualReviewedAt) {
        this.manualReviewedAt = manualReviewedAt;
    }

    public String getManualRejectionReason() {
        return manualRejectionReason;
    }

    public void setManualRejectionReason(String manualRejectionReason) {
        this.manualRejectionReason = manualRejectionReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void markAsPaid(String providerPaymentId) {
        this.status = PaymentStatus.PAID;
        this.providerPaymentId = providerPaymentId;
        this.paidAt = LocalDateTime.now();
    }

    public void markAsPaidByOrder(String providerOrderId) {
        this.status = PaymentStatus.PAID;
        this.providerOrderId = providerOrderId;
        this.paidAt = LocalDateTime.now();
    }

    public void markAsFailed(String providerPaymentId) {
        this.status = PaymentStatus.FAILED;
        this.providerPaymentId = providerPaymentId;
    }

    public void markAsCancelled() {
        this.status = PaymentStatus.CANCELLED;
    }

    public void markAsRejected(User reviewer, String reason) {
        this.status = PaymentStatus.REJECTED;
        this.manualReviewedBy = reviewer;
        this.manualReviewedAt = LocalDateTime.now();
        this.manualRejectionReason = reason;
    }
}
