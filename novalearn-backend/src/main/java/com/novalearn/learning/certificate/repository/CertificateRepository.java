package com.novalearn.learning.certificate.repository;

import com.novalearn.learning.certificate.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    Optional<Certificate> findByEnrollmentId(Long enrollmentId);

    Optional<Certificate> findByIdAndEnrollmentStudentId(Long id, Long studentId);

    Optional<Certificate> findByCertificateCode(String certificateCode);

    boolean existsByEnrollmentId(Long enrollmentId);

    boolean existsByCertificateCode(String certificateCode);

    List<Certificate> findByEnrollmentStudentIdOrderByIssuedAtDesc(Long studentId);
}
