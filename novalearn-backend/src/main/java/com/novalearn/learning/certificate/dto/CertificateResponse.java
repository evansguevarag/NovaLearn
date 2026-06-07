package com.novalearn.learning.certificate.dto;

import com.novalearn.learning.certificate.entity.Certificate;

import java.time.LocalDateTime;

public class CertificateResponse {

    private Long id;
    private Long enrollmentId;
    private Long studentId;
    private String studentEmail;
    private Long courseId;
    private String courseTitle;
    private String certificateCode;
    private String certificateUrl;
    private LocalDateTime issuedAt;

    public CertificateResponse(Certificate certificate) {
        this.id = certificate.getId();
        this.enrollmentId = certificate.getEnrollment().getId();
        this.studentId = certificate.getEnrollment().getStudent().getId();
        this.studentEmail = certificate.getEnrollment().getStudent().getEmail();
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

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentEmail() {
        return studentEmail;
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