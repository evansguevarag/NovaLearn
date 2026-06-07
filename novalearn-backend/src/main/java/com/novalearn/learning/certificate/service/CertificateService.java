package com.novalearn.learning.certificate.service;

import com.novalearn.learning.certificate.dto.CertificateResponse;
import com.novalearn.learning.certificate.entity.Certificate;
import com.novalearn.learning.certificate.repository.CertificateRepository;
import com.novalearn.learning.enrollment.entity.Enrollment;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CertificateService(
            CertificateRepository certificateRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.certificateRepository = certificateRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional
    public CertificateResponse generateCertificate(Long enrollmentId) {

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

        return new CertificateResponse(savedCertificate);
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