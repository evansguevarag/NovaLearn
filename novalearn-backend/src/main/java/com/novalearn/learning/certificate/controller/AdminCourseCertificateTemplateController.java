package com.novalearn.learning.certificate.controller;

import com.novalearn.learning.certificate.dto.CourseCertificateTemplateResponse;
import com.novalearn.learning.certificate.dto.UpdateCourseCertificateTemplateLayoutRequest;
import com.novalearn.learning.certificate.service.CourseCertificateTemplateService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/courses/{courseId}/certificate-template")
public class AdminCourseCertificateTemplateController {

    private final CourseCertificateTemplateService templateService;

    public AdminCourseCertificateTemplateController(
            CourseCertificateTemplateService templateService
    ) {
        this.templateService = templateService;
    }

    @GetMapping
    public ResponseEntity<CourseCertificateTemplateResponse> find(
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(
                templateService.findForAdmin(courseId)
        );
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseCertificateTemplateResponse> upload(
            @PathVariable Long courseId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(
                templateService.uploadForAdmin(courseId, file)
        );
    }

    @PutMapping
    public ResponseEntity<CourseCertificateTemplateResponse> updateLayout(
            @PathVariable Long courseId,
            @Valid @RequestBody UpdateCourseCertificateTemplateLayoutRequest request
    ) {
        return ResponseEntity.ok(
                templateService.updateLayoutForAdmin(courseId, request)
        );
    }
}
