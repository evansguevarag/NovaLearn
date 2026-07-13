package com.novalearn.payment.dto;

import java.math.BigDecimal;

public class PaymentSettingsResponse {

    private final BigDecimal processingFeePercentage;
    private final BigDecimal processingFeeTaxPercentage;
    private final boolean passProcessingFeeToStudent;
    private final boolean culqiPaymentsEnabled;
    private final boolean manualPaymentsEnabled;

    public PaymentSettingsResponse(
            BigDecimal processingFeePercentage,
            BigDecimal processingFeeTaxPercentage,
            boolean passProcessingFeeToStudent,
            boolean culqiPaymentsEnabled,
            boolean manualPaymentsEnabled
    ) {
        this.processingFeePercentage = processingFeePercentage;
        this.processingFeeTaxPercentage = processingFeeTaxPercentage;
        this.passProcessingFeeToStudent = passProcessingFeeToStudent;
        this.culqiPaymentsEnabled = culqiPaymentsEnabled;
        this.manualPaymentsEnabled = manualPaymentsEnabled;
    }

    public BigDecimal getProcessingFeePercentage() {
        return processingFeePercentage;
    }

    public BigDecimal getProcessingFeeTaxPercentage() {
        return processingFeeTaxPercentage;
    }

    public boolean isPassProcessingFeeToStudent() {
        return passProcessingFeeToStudent;
    }

    public boolean isCulqiPaymentsEnabled() {
        return culqiPaymentsEnabled;
    }

    public boolean isManualPaymentsEnabled() {
        return manualPaymentsEnabled;
    }
}
