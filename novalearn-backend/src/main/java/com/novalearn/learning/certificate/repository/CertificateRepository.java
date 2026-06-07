package com.novalearn.learning.certificate.repository;

import com.novalearn.learning.certificate.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    Optional<Certificate> findByEnrollmentId(Long enrollmentId);

    Optional<Certificate> findByCertificateCode(String certificateCode);

    boolean existsByEnrollmentId(Long enrollmentId);

    boolean existsByCertificateCode(String certificateCode);
}
