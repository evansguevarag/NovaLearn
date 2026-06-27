package com.novalearn.payment.culqi;

public class CulqiChargeVerification {

    private final boolean paid;
    private final String providerPaymentId;
    private final String rawStatus;

    public CulqiChargeVerification(
            boolean paid,
            String providerPaymentId,
            String rawStatus
    ) {
        this.paid = paid;
        this.providerPaymentId = providerPaymentId;
        this.rawStatus = rawStatus;
    }

    public boolean isPaid() {
        return paid;
    }

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public String getRawStatus() {
        return rawStatus;
    }
}
