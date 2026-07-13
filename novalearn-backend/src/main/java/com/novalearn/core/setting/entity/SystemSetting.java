package com.novalearn.core.setting.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings")
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "platform_name", nullable = false, length = 100)
    private String platformName = "NovaLearn";

    @Column(name = "support_email", nullable = false)
    private String supportEmail = "support@novalearn.local";

    @Column(name = "default_currency", nullable = false, length = 10)
    private String defaultCurrency = "PEN";

    @Column(name = "certificate_enabled", nullable = false)
    private boolean certificateEnabled = true;

    @Column(name = "coupons_enabled", nullable = false)
    private boolean couponsEnabled = true;

    @Column(name = "payment_processing_fee_percentage", nullable = false)
    private BigDecimal paymentProcessingFeePercentage =
            BigDecimal.valueOf(4.02);

    @Column(name = "payment_processing_fee_tax_percentage", nullable = false)
    private BigDecimal paymentProcessingFeeTaxPercentage = BigDecimal.ZERO;

    @Column(name = "pass_processing_fee_to_student", nullable = false)
    private boolean passProcessingFeeToStudent = true;

    @Column(name = "culqi_payments_enabled", nullable = false)
    private boolean culqiPaymentsEnabled = true;

    @Column(name = "manual_payments_enabled", nullable = false)
    private boolean manualPaymentsEnabled = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getPaymentProcessingFeePercentage() {
        return paymentProcessingFeePercentage;
    }

    public void setPaymentProcessingFeePercentage(
            BigDecimal paymentProcessingFeePercentage
    ) {
        this.paymentProcessingFeePercentage =
                paymentProcessingFeePercentage;
    }

    public BigDecimal getPaymentProcessingFeeTaxPercentage() {
        return paymentProcessingFeeTaxPercentage;
    }

    public void setPaymentProcessingFeeTaxPercentage(
            BigDecimal paymentProcessingFeeTaxPercentage
    ) {
        this.paymentProcessingFeeTaxPercentage =
                paymentProcessingFeeTaxPercentage;
    }

    public boolean isPassProcessingFeeToStudent() {
        return passProcessingFeeToStudent;
    }

    public void setPassProcessingFeeToStudent(
            boolean passProcessingFeeToStudent
    ) {
        this.passProcessingFeeToStudent = passProcessingFeeToStudent;
    }

    public boolean isCulqiPaymentsEnabled() {
        return culqiPaymentsEnabled;
    }

    public void setCulqiPaymentsEnabled(boolean culqiPaymentsEnabled) {
        this.culqiPaymentsEnabled = culqiPaymentsEnabled;
    }

    public boolean isManualPaymentsEnabled() {
        return manualPaymentsEnabled;
    }

    public void setManualPaymentsEnabled(boolean manualPaymentsEnabled) {
        this.manualPaymentsEnabled = manualPaymentsEnabled;
    }
}
