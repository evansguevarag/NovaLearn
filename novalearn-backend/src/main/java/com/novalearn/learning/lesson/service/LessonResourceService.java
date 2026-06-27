package com.novalearn.learning.lesson.service;

import com.novalearn.common.exception.BadRequestException;
import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.core.user.entity.User;
import com.novalearn.instructor.security.service.InstructorContentAccessService;
import com.novalearn.learning.lesson.dto.LessonResponse;
import com.novalearn.learning.lesson.entity.Lesson;
import com.novalearn.learning.lesson.enums.LessonType;
import com.novalearn.learning.lesson.repository.LessonRepository;
import com.novalearn.media.dto.FileUploadResponse;
import com.novalearn.media.entity.FileAsset;
import com.novalearn.media.repository.FileAssetRepository;
import com.novalearn.media.service.CloudinaryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LessonResourceService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    LessonResourceService.class
            );

    private static final String PDF_MIME_TYPE =
            "application/pdf";

    private static final String IMAGE_RESOURCE_TYPE =
            "image";

    private static final String RAW_RESOURCE_TYPE =
            "raw";

    private final LessonRepository lessonRepository;
    private final FileAssetRepository fileAssetRepository;
    private final CloudinaryService cloudinaryService;
    private final InstructorContentAccessService accessService;

    public LessonResourceService(
            LessonRepository lessonRepository,
            FileAssetRepository fileAssetRepository,
            CloudinaryService cloudinaryService,
            InstructorContentAccessService accessService
    ) {
        this.lessonRepository = lessonRepository;
        this.fileAssetRepository = fileAssetRepository;
        this.cloudinaryService = cloudinaryService;
        this.accessService = accessService;
    }

    @Transactional
    public LessonResponse uploadForAdmin(
            Long lessonId,
            MultipartFile file,
            User authenticatedUser
    ) {
        Lesson lesson = findLesson(lessonId);

        return uploadResource(
                lesson,
                file,
                authenticatedUser
        );
    }

    @Transactional
    public LessonResponse uploadForInstructor(
            Long lessonId,
            MultipartFile file,
            User authenticatedUser
    ) {
        Lesson lesson =
                accessService.getAccessibleLesson(
                        lessonId,
                        authenticatedUser
                );

        return uploadResource(
                lesson,
                file,
                authenticatedUser
        );
    }

    @Transactional
    public LessonResponse deleteForAdmin(
            Long lessonId
    ) {
        Lesson lesson = findLesson(lessonId);

        return deleteResource(lesson);
    }

    @Transactional
    public LessonResponse deleteForInstructor(
            Long lessonId,
            User authenticatedUser
    ) {
        Lesson lesson =
                accessService.getAccessibleLesson(
                        lessonId,
                        authenticatedUser
                );

        return deleteResource(lesson);
    }

    private LessonResponse uploadResource(
            Lesson lesson,
            MultipartFile file,
            User authenticatedUser
    ) {
        validateAuthenticatedUser(
                authenticatedUser
        );

        validateResourceLesson(lesson);

        FileAsset previousResource =
                lesson.getResourceFile();

        FileUploadResponse uploadResponse =
                cloudinaryService.uploadPdf(file);

        FileAsset newResource =
                createFileAsset(
                        file,
                        authenticatedUser,
                        uploadResponse
                );

        try {
            FileAsset savedResource =
                    fileAssetRepository.save(
                            newResource
                    );

            lesson.setResourceFile(
                    savedResource
            );

            Lesson savedLesson =
                    lessonRepository.save(
                            lesson
                    );

            removePreviousResource(
                    previousResource
            );

            return new LessonResponse(
                    savedLesson
            );
        } catch (RuntimeException exception) {
            deleteCloudinaryResourceQuietly(
                    uploadResponse.getPublicId(),
                    uploadResponse.getResourceType()
            );

            throw exception;
        }
    }

    private LessonResponse deleteResource(
            Lesson lesson
    ) {
        FileAsset resource =
                lesson.getResourceFile();

        if (resource == null) {
            return new LessonResponse(lesson);
        }

        lesson.removeResourceFile();

        Lesson savedLesson =
                lessonRepository.save(
                        lesson
                );

        fileAssetRepository.delete(
                resource
        );

        deleteStoredPdfQuietly(
                resource.getPublicId()
        );

        return new LessonResponse(
                savedLesson
        );
    }

    private FileAsset createFileAsset(
            MultipartFile file,
            User authenticatedUser,
            FileUploadResponse uploadResponse
    ) {
        FileAsset fileAsset =
                new FileAsset();

        fileAsset.setUploadedBy(
                authenticatedUser
        );

        fileAsset.setPublicId(
                uploadResponse.getPublicId()
        );

        fileAsset.setUrl(
                uploadResponse.getUrl()
        );

        fileAsset.setFileName(
                normalizeFilename(
                        file.getOriginalFilename()
                )
        );

        fileAsset.setMimeType(
                PDF_MIME_TYPE
        );

        fileAsset.setFileSize(
                file.getSize()
        );

        return fileAsset;
    }

    private void removePreviousResource(
            FileAsset previousResource
    ) {
        if (previousResource == null) {
            return;
        }

        fileAssetRepository.delete(
                previousResource
        );

        deleteStoredPdfQuietly(
                previousResource.getPublicId()
        );
    }

    private void deleteStoredPdfQuietly(
            String publicId
    ) {
        /*
         * Los PDFs actuales se almacenan como
         * resource_type image para permitir
         * visualización y transformaciones.
         *
         * También se intenta eliminar como raw
         * para limpiar archivos subidos con la
         * implementación anterior.
         */
        deleteCloudinaryResourceQuietly(
                publicId,
                IMAGE_RESOURCE_TYPE
        );

        deleteCloudinaryResourceQuietly(
                publicId,
                RAW_RESOURCE_TYPE
        );
    }

    private void deleteCloudinaryResourceQuietly(
            String publicId,
            String resourceType
    ) {
        if (
                publicId == null ||
                publicId.isBlank()
        ) {
            return;
        }

        try {
            cloudinaryService.deleteResource(
                    publicId,
                    resourceType
            );
        } catch (RuntimeException exception) {
            LOGGER.warn(
                    "No se pudo eliminar el recurso {} de Cloudinary con resource_type {}.",
                    publicId,
                    resourceType,
                    exception
            );
        }
    }

    private Lesson findLesson(
            Long lessonId
    ) {
        return lessonRepository
                .findByIdAndDeletedAtIsNull(
                        lessonId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Lección no encontrada"
                        )
                );
    }

    private void validateResourceLesson(
            Lesson lesson
    ) {
        if (
                lesson.getLessonType()
                        != LessonType.RESOURCE
        ) {
            throw new BadRequestException(
                    "Solo las lecciones de tipo RESOURCE pueden tener archivos PDF"
            );
        }
    }

    private void validateAuthenticatedUser(
            User authenticatedUser
    ) {
        if (authenticatedUser == null) {
            throw new BadRequestException(
                    "No se pudo identificar al usuario autenticado"
            );
        }
    }

    private String normalizeFilename(
            String filename
    ) {
        if (
                filename == null ||
                filename.isBlank()
        ) {
            return "recurso.pdf";
        }

        String normalized =
                filename.trim()
                        .replace("\\", "_")
                        .replace("/", "_");

        if (normalized.length() <= 255) {
            return normalized;
        }

        return normalized.substring(
                normalized.length() - 255
        );
    }
}