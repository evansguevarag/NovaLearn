package com.novalearn.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class UpdatePaymentSettingsRequest {

    @NotNull(message = "El porcentaje de Culqi es obligatorio")
    @DecimalMin(
            value = "0.00",
            message = "El porcentaje de Culqi no puede ser negativo"
    )
    private BigDecimal processingFeePercentage;

    private boolean passProcessingFeeToStudent;
    private boolean culqiPaymentsEnabled = true;
    private boolean manualPaymentsEnabled = true;

    public BigDecimal getProcessingFeePercentage() {
        return processingFeePercentage;
    }

    public void setProcessingFeePercentage(
            BigDecimal processingFeePercentage
    ) {
        this.processingFeePercentage = processingFeePercentage;
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
