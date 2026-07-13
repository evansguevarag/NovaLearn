package com.novalearn.learning.certificate.entity;

import com.novalearn.learning.course.entity.Course;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "course_certificate_templates",
        indexes = {
                @Index(name = "idx_course_certificate_templates_course", columnList = "course_id")
        }
)
public class CourseCertificateTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false, unique = true)
    private Course course;

    @Column(name = "template_url", nullable = false, length = 1000)
    private String templateUrl;

    @Column(name = "template_public_id", length = 500)
    private String templatePublicId;

    @Column(name = "template_resource_type", length = 50)
    private String templateResourceType;

    @Column(name = "student_name_x", nullable = false, precision = 5, scale = 2)
    private BigDecimal studentNameX = BigDecimal.valueOf(50);

    @Column(name = "student_name_y", nullable = false, precision = 5, scale = 2)
    private BigDecimal studentNameY = BigDecimal.valueOf(48);

    @Column(name = "course_title_x", nullable = false, precision = 5, scale = 2)
    private BigDecimal courseTitleX = BigDecimal.valueOf(50);

    @Column(name = "course_title_y", nullable = false, precision = 5, scale = 2)
    private BigDecimal courseTitleY = BigDecimal.valueOf(36);

    @Column(name = "issued_at_x", nullable = false, precision = 5, scale = 2)
    private BigDecimal issuedAtX = BigDecimal.valueOf(50);

    @Column(name = "issued_at_y", nullable = false, precision = 5, scale = 2)
    private BigDecimal issuedAtY = BigDecimal.valueOf(26);

    @Column(name = "certificate_code_x", nullable = false, precision = 5, scale = 2)
    private BigDecimal certificateCodeX = BigDecimal.valueOf(50);

    @Column(name = "certificate_code_y", nullable = false, precision = 5, scale = 2)
    private BigDecimal certificateCodeY = BigDecimal.valueOf(13);

    @Column(name = "qr_x", nullable = false, precision = 5, scale = 2)
    private BigDecimal qrX = BigDecimal.valueOf(82);

    @Column(name = "qr_y", nullable = false, precision = 5, scale = 2)
    private BigDecimal qrY = BigDecimal.valueOf(12);

    @Column(name = "primary_text_color", nullable = false, length = 20)
    private String primaryTextColor = "#111111";

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getTemplateUrl() {
        return templateUrl;
    }

    public void setTemplateUrl(String templateUrl) {
        this.templateUrl = templateUrl;
    }

    public String getTemplatePublicId() {
        return templatePublicId;
    }

    public void setTemplatePublicId(String templatePublicId) {
        this.templatePublicId = templatePublicId;
    }

    public String getTemplateResourceType() {
        return templateResourceType;
    }

    public void setTemplateResourceType(String templateResourceType) {
        this.templateResourceType = templateResourceType;
    }

    public BigDecimal getStudentNameX() {
        return studentNameX;
    }

    public void setStudentNameX(BigDecimal studentNameX) {
        this.studentNameX = studentNameX;
    }

    public BigDecimal getStudentNameY() {
        return studentNameY;
    }

    public void setStudentNameY(BigDecimal studentNameY) {
        this.studentNameY = studentNameY;
    }

    public BigDecimal getCourseTitleX() {
        return courseTitleX;
    }

    public void setCourseTitleX(BigDecimal courseTitleX) {
        this.courseTitleX = courseTitleX;
    }

    public BigDecimal getCourseTitleY() {
        return courseTitleY;
    }

    public void setCourseTitleY(BigDecimal courseTitleY) {
        this.courseTitleY = courseTitleY;
    }

    public BigDecimal getIssuedAtX() {
        return issuedAtX;
    }

    public void setIssuedAtX(BigDecimal issuedAtX) {
        this.issuedAtX = issuedAtX;
    }

    public BigDecimal getIssuedAtY() {
        return issuedAtY;
    }

    public void setIssuedAtY(BigDecimal issuedAtY) {
        this.issuedAtY = issuedAtY;
    }

    public BigDecimal getCertificateCodeX() {
        return certificateCodeX;
    }

    public void setCertificateCodeX(BigDecimal certificateCodeX) {
        this.certificateCodeX = certificateCodeX;
    }

    public BigDecimal getCertificateCodeY() {
        return certificateCodeY;
    }

    public void setCertificateCodeY(BigDecimal certificateCodeY) {
        this.certificateCodeY = certificateCodeY;
    }

    public BigDecimal getQrX() {
        return qrX;
    }

    public void setQrX(BigDecimal qrX) {
        this.qrX = qrX;
    }

    public BigDecimal getQrY() {
        return qrY;
    }

    public void setQrY(BigDecimal qrY) {
        this.qrY = qrY;
    }

    public String getPrimaryTextColor() {
        return primaryTextColor;
    }

    public void setPrimaryTextColor(String primaryTextColor) {
        this.primaryTextColor = primaryTextColor;
    }

    public Boolean getActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
