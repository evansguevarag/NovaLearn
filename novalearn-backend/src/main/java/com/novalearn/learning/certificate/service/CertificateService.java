package com.novalearn.learning.certificate.service;

import com.novalearn.learning.certificate.dto.CertificateResponse;
import com.novalearn.learning.certificate.entity.Certificate;
import com.novalearn.learning.certificate.repository.CertificateRepository;
import com.novalearn.learning.enrollment.entity.Enrollment;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.novalearn.notification.email.service.EmailService;
import com.novalearn.notification.email.service.EmailTemplateService;
import com.novalearn.notification.internal.enums.NotificationType;
import com.novalearn.notification.internal.service.UserNotificationService;
import com.novalearn.audit.enums.AuditAction;
import com.novalearn.audit.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final UserNotificationService userNotificationService;
    private final AuditLogService auditLogService;

    public CertificateService(
            CertificateRepository certificateRepository,
            EnrollmentRepository enrollmentRepository,
            EmailService emailService,
            EmailTemplateService emailTemplateService,
            UserNotificationService userNotificationService,
            AuditLogService auditLogService
    ) {
        this.certificateRepository = certificateRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.emailService = emailService;
        this.emailTemplateService = emailTemplateService;
        this.userNotificationService = userNotificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public CertificateResponse generateCertificate(Long enrollmentId, HttpServletRequest httpRequest) {

        Enrollment enrollment = enrollmentRepository.findByIdAndDeletedAtIsNull(enrollmentId)
                .orElseThrow(() -> new IllegalArgumentException("Matricula no encontrada"));

        if (enrollment.getProgressPercentage().compareTo(BigDecimal.valueOf(100)) < 0) {
            throw new IllegalArgumentException("El curso aun no esta completado al 100%");
        }

        if (certificateRepository.existsByEnrollmentId(enrollmentId)) {
            Certificate existingCertificate = certificateRepository.findByEnrollmentId(enrollmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Certificado no encontrado"));

            return new CertificateResponse(existingCertificate);
        }

        Certificate certificate = new Certificate();
        certificate.setEnrollment(enrollment);
        certificate.setCertificateCode(generateUniqueCertificateCode());
        certificate.setCertificateUrl(null);

        Certificate savedCertificate = certificateRepository.save(certificate);

        CertificateResponse response = new CertificateResponse(savedCertificate);

        auditLogService.register(
        enrollment.getStudent(),
        AuditAction.CERTIFICATE_GENERATED,
        "Certificate",
        String.valueOf(savedCertificate.getId()),
        "Certificado generado para el curso " + enrollment.getCourse().getTitle(),
        httpRequest
        );

        userNotificationService.createSystemNotification(
        enrollment.getStudent(),
        "Certificado generado",
        "Tu certificado del curso " + enrollment.getCourse().getTitle() + " esta listo. Codigo: " + response.getCertificateCode(),
        NotificationType.CERTIFICATE
        );

        try {
            emailService.sendEmail(
                    enrollment.getStudent().getEmail(),
                    emailTemplateService.certificateSubject(),
                    emailTemplateService.certificateHtml(response)
            );
        } catch (Exception ignored) {
        }

        return response;
    }

    @Transactional(readOnly = true)
    public CertificateResponse findByEnrollment(Long enrollmentId) {
        Certificate certificate = certificateRepository.findByEnrollmentId(enrollmentId)
                .orElseThrow(() -> new IllegalArgumentException("Certificado no encontrado"));

        return new CertificateResponse(certificate);
    }

    @Transactional(readOnly = true)
    public CertificateResponse findByCode(String certificateCode) {
        Certificate certificate = certificateRepository.findByCertificateCode(certificateCode)
                .orElseThrow(() -> new IllegalArgumentException("Certificado no encontrado"));

        return new CertificateResponse(certificate);
    }

    private String generateUniqueCertificateCode() {
        String code;

        do {
            code = "NL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (certificateRepository.existsByCertificateCode(code));

        return code;
    }
}