package com.novalearn.payment.culqi;

public class CulqiOrderVerification {

    private final boolean paid;
    private final boolean reusable;
    private final String providerOrderId;
    private final String rawStatus;
    private final Long expirationEpochSeconds;

    public CulqiOrderVerification(
            boolean paid,
            boolean reusable,
            String providerOrderId,
            String rawStatus,
            Long expirationEpochSeconds
    ) {
        this.paid = paid;
        this.reusable = reusable;
        this.providerOrderId = providerOrderId;
        this.rawStatus = rawStatus;
        this.expirationEpochSeconds = expirationEpochSeconds;
    }

    public boolean isPaid() {
        return paid;
    }

    public boolean isReusable() {
        return reusable;
    }

    public String getProviderOrderId() {
        return providerOrderId;
    }

    public String getRawStatus() {
        return rawStatus;
    }

    public Long getExpirationEpochSeconds() {
        return expirationEpochSeconds;
    }
}
