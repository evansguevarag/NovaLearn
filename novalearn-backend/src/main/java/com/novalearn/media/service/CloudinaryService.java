package com.novalearn.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.novalearn.config.cloudinary.CloudinaryProperties;
import com.novalearn.media.dto.FileUploadResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final CloudinaryProperties properties;

    public CloudinaryService(
            Cloudinary cloudinary,
            CloudinaryProperties properties
    ) {
        this.cloudinary = cloudinary;
        this.properties = properties;
    }

    public FileUploadResponse uploadImage(MultipartFile file) {

        validateImage(file);

        try {
            Map <?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", properties.getFolder(),
                            "resource_type", "image"
                    )
            );

            String secureUrl = String.valueOf(uploadResult.get("secure_url"));
            String publicId = String.valueOf(uploadResult.get("public_id"));
            String resourceType = String.valueOf(uploadResult.get("resource_type"));
            String format = String.valueOf(uploadResult.get("format"));

            return new FileUploadResponse(
                    secureUrl,
                    publicId,
                    resourceType,
                    format
            );

        } catch (IOException e) {
            throw new IllegalArgumentException("No se pudo subir la imagen a Cloudinary");
        }
    }

    private void validateImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo es obligatorio");
        }

        String contentType = file.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Solo se permiten imagenes");
        }
    }
}
