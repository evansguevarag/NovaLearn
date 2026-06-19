package com.novalearn.learning.certificate.controller;

import com.novalearn.learning.certificate.dto.CertificateResponse;
import com.novalearn.learning.certificate.service.CertificateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/certificates")
public class CertificateController {

        private final CertificateService certificateService;

        public CertificateController(CertificateService certificateService) {
                this.certificateService = certificateService;
        }

        @PostMapping("/admin/enrollment/{enrollmentId}")
        public ResponseEntity<CertificateResponse> generateCertificate(
                @PathVariable Long enrollmentId,
                HttpServletRequest httpRequest
        ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(certificateService.generateCertificate(enrollmentId, httpRequest));
        }

        @GetMapping("/enrollment/{enrollmentId}")
        public ResponseEntity<CertificateResponse> findByEnrollment(
                @PathVariable Long enrollmentId
        ) {
                return ResponseEntity.ok(
                        certificateService.findByEnrollment(enrollmentId)
                );
        }

        @GetMapping("/code/{certificateCode}")
        public ResponseEntity<CertificateResponse> findByCode(
                @PathVariable String certificateCode
        ) {
                return ResponseEntity.ok(
                        certificateService.findByCode(certificateCode)
                );
        }
}