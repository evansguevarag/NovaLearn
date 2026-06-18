package com.novalearn.student.dashboard.dto;

import com.novalearn.learning.certificate.entity.Certificate;

import java.time.LocalDateTime;

public class StudentCertificateDashboardResponse {

    private Long id;
    private Long enrollmentId;
    private Long courseId;
    private String courseTitle;
    private String certificateCode;
    private String certificateUrl;
    private LocalDateTime issuedAt;

    public StudentCertificateDashboardResponse(Certificate certificate) {
        this.id = certificate.getId();
        this.enrollmentId = certificate.getEnrollment().getId();
        this.courseId = certificate.getEnrollment().getCourse().getId();
        this.courseTitle = certificate.getEnrollment().getCourse().getTitle();
        this.certificateCode = certificate.getCertificateCode();
        this.certificateUrl = certificate.getCertificateUrl();
        this.issuedAt = certificate.getIssuedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public String getCertificateCode() {
        return certificateCode;
    }

    public String getCertificateUrl() {
        return certificateUrl;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }
}