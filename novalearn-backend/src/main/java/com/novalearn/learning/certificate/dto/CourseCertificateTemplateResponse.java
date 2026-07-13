package com.novalearn.learning.certificate.dto;

import com.novalearn.learning.certificate.entity.CourseCertificateTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CourseCertificateTemplateResponse {

    private final Long id;
    private final Long courseId;
    private final String templateUrl;
    private final BigDecimal studentNameX;
    private final BigDecimal studentNameY;
    private final BigDecimal courseTitleX;
    private final BigDecimal courseTitleY;
    private final BigDecimal issuedAtX;
    private final BigDecimal issuedAtY;
    private final BigDecimal certificateCodeX;
    private final BigDecimal certificateCodeY;
    private final BigDecimal qrX;
    private final BigDecimal qrY;
    private final String primaryTextColor;
    private final Boolean active;
    private final LocalDateTime updatedAt;

    public CourseCertificateTemplateResponse(
            CourseCertificateTemplate template
    ) {
        this.id = template.getId();
        this.courseId = template.getCourse().getId();
        this.templateUrl = template.getTemplateUrl();
        this.studentNameX = template.getStudentNameX();
        this.studentNameY = template.getStudentNameY();
        this.courseTitleX = template.getCourseTitleX();
        this.courseTitleY = template.getCourseTitleY();
        this.issuedAtX = template.getIssuedAtX();
        this.issuedAtY = template.getIssuedAtY();
        this.certificateCodeX = template.getCertificateCodeX();
        this.certificateCodeY = template.getCertificateCodeY();
        this.qrX = template.getQrX();
        this.qrY = template.getQrY();
        this.primaryTextColor = template.getPrimaryTextColor();
        this.active = template.getActive();
        this.updatedAt = template.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getTemplateUrl() {
        return templateUrl;
    }

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

    public Boolean getActive() {
        return active;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
