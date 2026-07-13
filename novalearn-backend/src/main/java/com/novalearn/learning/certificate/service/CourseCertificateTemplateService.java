package com.novalearn.learning.certificate.service;

import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.core.user.entity.User;
import com.novalearn.instructor.security.service.InstructorContentAccessService;
import com.novalearn.learning.certificate.dto.CourseCertificateTemplateResponse;
import com.novalearn.learning.certificate.dto.UpdateCourseCertificateTemplateLayoutRequest;
import com.novalearn.learning.certificate.entity.CourseCertificateTemplate;
import com.novalearn.learning.certificate.repository.CourseCertificateTemplateRepository;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.media.dto.FileUploadResponse;
import com.novalearn.media.service.CloudinaryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CourseCertificateTemplateService {

    private final CourseCertificateTemplateRepository templateRepository;
    private final CourseRepository courseRepository;
    private final CloudinaryService cloudinaryService;
    private final InstructorContentAccessService accessService;

    public CourseCertificateTemplateService(
            CourseCertificateTemplateRepository templateRepository,
            CourseRepository courseRepository,
            CloudinaryService cloudinaryService,
            InstructorContentAccessService accessService
    ) {
        this.templateRepository = templateRepository;
        this.courseRepository = courseRepository;
        this.cloudinaryService = cloudinaryService;
        this.accessService = accessService;
    }

    @Transactional(readOnly = true)
    public CourseCertificateTemplateResponse findForAdmin(
            Long courseId
    ) {
        CourseCertificateTemplate template =
                findTemplate(courseId);

        return new CourseCertificateTemplateResponse(template);
    }

    @Transactional(readOnly = true)
    public CourseCertificateTemplateResponse findForInstructor(
            Long courseId,
            User user
    ) {
        accessService.getAccessibleCourse(courseId, user);

        CourseCertificateTemplate template =
                findTemplate(courseId);

        return new CourseCertificateTemplateResponse(template);
    }

    @Transactional
    public CourseCertificateTemplateResponse uploadForAdmin(
            Long courseId,
            MultipartFile file
    ) {
        Course course = courseRepository
                .findByIdAndDeletedAtIsNull(courseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Curso no encontrado"
                        )
                );

        return uploadTemplate(course, file);
    }

    @Transactional
    public CourseCertificateTemplateResponse uploadForInstructor(
            Long courseId,
            MultipartFile file,
            User user
    ) {
        Course course = accessService.getAccessibleCourse(
                courseId,
                user
        );

        return uploadTemplate(course, file);
    }

    @Transactional
    public CourseCertificateTemplateResponse updateLayoutForAdmin(
            Long courseId,
            UpdateCourseCertificateTemplateLayoutRequest request
    ) {
        courseRepository
                .findByIdAndDeletedAtIsNull(courseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Curso no encontrado"
                        )
                );

        CourseCertificateTemplate template =
                findTemplate(courseId);

        applyLayout(template, request);

        return new CourseCertificateTemplateResponse(template);
    }

    @Transactional
    public CourseCertificateTemplateResponse updateLayoutForInstructor(
            Long courseId,
            UpdateCourseCertificateTemplateLayoutRequest request,
            User user
    ) {
        accessService.getAccessibleCourse(courseId, user);

        CourseCertificateTemplate template =
                findTemplate(courseId);

        applyLayout(template, request);

        return new CourseCertificateTemplateResponse(template);
    }

    private CourseCertificateTemplateResponse uploadTemplate(
            Course course,
            MultipartFile file
    ) {
        CourseCertificateTemplate template =
                templateRepository.findByCourseId(course.getId())
                        .orElseGet(CourseCertificateTemplate::new);

        String previousPublicId =
                template.getTemplatePublicId();
        String previousResourceType =
                template.getTemplateResourceType();

        FileUploadResponse uploadResponse =
                cloudinaryService.uploadImage(file);

        template.setCourse(course);
        template.setTemplateUrl(uploadResponse.getUrl());
        template.setTemplatePublicId(uploadResponse.getPublicId());
        template.setTemplateResourceType(uploadResponse.getResourceType());

        CourseCertificateTemplate savedTemplate =
                templateRepository.save(template);

        deletePreviousTemplateQuietly(
                previousPublicId,
                previousResourceType
        );

        return new CourseCertificateTemplateResponse(savedTemplate);
    }

    private CourseCertificateTemplate findTemplate(
            Long courseId
    ) {
        return templateRepository.findByCourseId(courseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Plantilla de certificado no configurada"
                        )
                );
    }

    private void applyLayout(
            CourseCertificateTemplate template,
            UpdateCourseCertificateTemplateLayoutRequest request
    ) {
        template.setStudentNameX(request.getStudentNameX());
        template.setStudentNameY(request.getStudentNameY());
        template.setCourseTitleX(request.getCourseTitleX());
        template.setCourseTitleY(request.getCourseTitleY());
        template.setIssuedAtX(request.getIssuedAtX());
        template.setIssuedAtY(request.getIssuedAtY());
        template.setCertificateCodeX(request.getCertificateCodeX());
        template.setCertificateCodeY(request.getCertificateCodeY());
        template.setQrX(request.getQrX());
        template.setQrY(request.getQrY());
        template.setPrimaryTextColor(request.getPrimaryTextColor());
    }

    private void deletePreviousTemplateQuietly(
            String publicId,
            String resourceType
    ) {
        try {
            cloudinaryService.deleteResource(publicId, resourceType);
        } catch (RuntimeException ignored) {
        }
    }
}
