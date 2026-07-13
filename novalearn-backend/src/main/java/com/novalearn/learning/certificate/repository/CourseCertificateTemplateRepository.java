package com.novalearn.learning.certificate.repository;

import com.novalearn.learning.certificate.entity.CourseCertificateTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourseCertificateTemplateRepository
        extends JpaRepository<CourseCertificateTemplate, Long> {

    Optional<CourseCertificateTemplate> findByCourseId(Long courseId);

    Optional<CourseCertificateTemplate> findByCourseIdAndActiveTrue(Long courseId);
}
