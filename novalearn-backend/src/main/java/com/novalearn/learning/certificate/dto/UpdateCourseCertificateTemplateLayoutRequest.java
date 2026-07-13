package com.novalearn.learning.certificate.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public class UpdateCourseCertificateTemplateLayoutRequest {

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal studentNameX;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal studentNameY;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal courseTitleX;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal courseTitleY;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal issuedAtX;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal issuedAtY;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal certificateCodeX;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal certificateCodeY;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal qrX;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal qrY;

    @NotNull
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$")
    private String primaryTextColor;

    public BigDecimal getStudentNameX() {
        return studentNameX;
    }

    public BigDecimal getStudentNameY() {
        return studentNameY;
    }

    public BigDecimal getCourseTitleX() {
        return courseTitleX;
    }

    public BigDecimal getCourseTitleY() {
        return courseTitleY;
    }

    public BigDecimal getIssuedAtX() {
        return issuedAtX;
    }

    public BigDecimal getIssuedAtY() {
        return issuedAtY;
    }

    public BigDecimal getCertificateCodeX() {
        return certificateCodeX;
    }

    public BigDecimal getCertificateCodeY() {
        return certificateCodeY;
    }

    public BigDecimal getQrX() {
        return qrX;
    }

    public BigDecimal getQrY() {
        return qrY;
    }

    public String getPrimaryTextColor() {
        return primaryTextColor;
    }
}
