package com.novalearn.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.novalearn.common.exception.BadRequestException;
import com.novalearn.config.cloudinary.CloudinaryProperties;
import com.novalearn.media.dto.FileUploadResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final long MAX_PDF_SIZE =
            20L * 1024L * 1024L;

    private static final String IMAGE_RESOURCE_TYPE =
            "image";

    private final Cloudinary cloudinary;
    private final CloudinaryProperties properties;

    public CloudinaryService(
            Cloudinary cloudinary,
            CloudinaryProperties properties
    ) {
        this.cloudinary = cloudinary;
        this.properties = properties;
    }

    public FileUploadResponse uploadImage(
            MultipartFile file
    ) {
        validateImage(file);

        try {
            Map<?, ?> uploadResult =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "folder",
                                    properties.getFolder(),
                                    "resource_type",
                                    IMAGE_RESOURCE_TYPE
                            )
                    );

            return mapUploadResponse(
                    uploadResult
            );
        } catch (IOException exception) {
            throw new BadRequestException(
                    "No se pudo subir la imagen a Cloudinary"
            );
        }
    }

    public FileUploadResponse uploadPdf(
            MultipartFile file
    ) {
        validatePdf(file);

        String resourceFolder =
                properties.getFolder()
                        + "/lesson-resources";

        try {
            Map<?, ?> uploadResult =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "folder",
                                    resourceFolder,
                                    "resource_type",
                                    IMAGE_RESOURCE_TYPE,
                                    "use_filename",
                                    true,
                                    "unique_filename",
                                    true,
                                    "overwrite",
                                    false
                            )
                    );

            return mapUploadResponse(
                    uploadResult
            );
        } catch (IOException exception) {
            throw new BadRequestException(
                    "No se pudo subir el archivo PDF a Cloudinary"
            );
        }
    }

    public void deleteResource(
            String publicId,
            String resourceType
    ) {
        if (
                publicId == null ||
                publicId.isBlank()
        ) {
            return;
        }

        String resolvedResourceType =
                resourceType == null ||
                resourceType.isBlank()
                        ? IMAGE_RESOURCE_TYPE
                        : resourceType;

        try {
            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type",
                            resolvedResourceType,
                            "invalidate",
                            true
                    )
            );
        } catch (IOException exception) {
            throw new BadRequestException(
                    "No se pudo eliminar el archivo de Cloudinary"
            );
        }
    }

    private FileUploadResponse mapUploadResponse(
            Map<?, ?> uploadResult
    ) {
        return new FileUploadResponse(
                getRequiredString(
                        uploadResult,
                        "secure_url"
                ),
                getRequiredString(
                        uploadResult,
                        "public_id"
                ),
                getOptionalString(
                        uploadResult,
                        "resource_type"
                ),
                getOptionalString(
                        uploadResult,
                        "format"
                )
        );
    }

    private String getRequiredString(
            Map<?, ?> values,
            String key
    ) {
        Object value = values.get(key);

        if (value == null) {
            throw new BadRequestException(
                    "Cloudinary no devolvió el campo requerido: "
                            + key
            );
        }

        return value.toString();
    }

    private String getOptionalString(
            Map<?, ?> values,
            String key
    ) {
        Object value = values.get(key);

        return value != null
                ? value.toString()
                : null;
    }

    private void validateImage(
            MultipartFile file
    ) {
        validateRequiredFile(file);

        String contentType =
                file.getContentType();

        if (
                contentType == null ||
                !contentType.startsWith("image/")
        ) {
            throw new BadRequestException(
                    "Solo se permiten imágenes"
            );
        }
    }

    private void validatePdf(
            MultipartFile file
    ) {
        validateRequiredFile(file);

        if (file.getSize() > MAX_PDF_SIZE) {
            throw new BadRequestException(
                    "El archivo PDF no debe superar los 20 MB"
            );
        }

        String contentType =
                file.getContentType();

        if (
                !"application/pdf".equalsIgnoreCase(
                        contentType
                )
        ) {
            throw new BadRequestException(
                    "Solo se permiten archivos PDF"
            );
        }

        String originalFilename =
                file.getOriginalFilename();

        if (
                originalFilename == null ||
                !originalFilename
                        .toLowerCase()
                        .endsWith(".pdf")
        ) {
            throw new BadRequestException(
                    "El archivo debe tener extensión .pdf"
            );
        }

        validatePdfSignature(file);
    }

    private void validatePdfSignature(
            MultipartFile file
    ) {
        try {
            byte[] signature =
                    file.getInputStream()
                            .readNBytes(5);

            String header = new String(
                    signature,
                    StandardCharsets.US_ASCII
            );

            if (!"%PDF-".equals(header)) {
                throw new BadRequestException(
                        "El archivo proporcionado no es un PDF válido"
                );
            }
        } catch (IOException exception) {
            throw new BadRequestException(
                    "No se pudo validar el archivo PDF"
            );
        }
    }

    private void validateRequiredFile(
            MultipartFile file
    ) {
        if (
                file == null ||
                file.isEmpty()
        ) {
            throw new BadRequestException(
                    "El archivo es obligatorio"
            );
        }
    }
}