package com.novalearn.config.culqi;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;

@ConfigurationProperties(prefix = "app.culqi")
public class CulqiProperties {

    private String apiBaseUrl;
    private String secretKey;
    private String publicKey;
    private String phoneNumber;
    private BigDecimal processingFeePercentage = BigDecimal.ZERO;
    private BigDecimal processingFeeTaxPercentage = BigDecimal.ZERO;
    private boolean passProcessingFeeToStudent;

    public String getApiBaseUrl() {
        return apiBaseUrl;
    }

    public void setApiBaseUrl(String apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    public String getPublicKey() {
        return publicKey;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public BigDecimal getProcessingFeePercentage() {
        return processingFeePercentage;
    }

    public void setProcessingFeePercentage(
            BigDecimal processingFeePercentage
    ) {
        this.processingFeePercentage = processingFeePercentage;
    }

    public BigDecimal getProcessingFeeTaxPercentage() {
        return processingFeeTaxPercentage;
    }

    public void setProcessingFeeTaxPercentage(
            BigDecimal processingFeeTaxPercentage
    ) {
        this.processingFeeTaxPercentage = processingFeeTaxPercentage;
    }

    public boolean isPassProcessingFeeToStudent() {
        return passProcessingFeeToStudent;
    }

    public void setPassProcessingFeeToStudent(
            boolean passProcessingFeeToStudent
    ) {
        this.passProcessingFeeToStudent = passProcessingFeeToStudent;
    }
}
