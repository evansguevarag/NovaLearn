package com.novalearn.media.dto;

public class FileUploadResponse {

    private String url;
    private String publicId;
    private String resourceType;
    private String format;

    public FileUploadResponse(
            String url,
            String publicId,
            String resourceType,
            String format
    ) {
        this.url = url;
        this.publicId = publicId;
        this.resourceType = resourceType;
        this.format = format;
    }

    public String getUrl() {
        return url;
    }

    public String getPublicId() {
        return publicId;
    }

    public String getResourceType() {
        return resourceType;
    }

    public String getFormat() {
        return format;
    }
}