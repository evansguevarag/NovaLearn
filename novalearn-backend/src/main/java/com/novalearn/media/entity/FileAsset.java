package com.novalearn.media.entity;

import com.novalearn.core.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "file_assets",
        indexes = {
                @Index(
                        name = "idx_file_assets_uploaded_by",
                        columnList = "uploaded_by"
                ),
                @Index(
                        name = "idx_file_assets_public_id",
                        columnList = "public_id"
                )
        }
)
public class FileAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "uploaded_by",
            nullable = false
    )
    private User uploadedBy;

    @Column(
            name = "public_id",
            nullable = false,
            length = 255
    )
    private String publicId;

    @Column(
            name = "url",
            nullable = false,
            length = 1000
    )
    private String url;

    @Column(
            name = "file_name",
            length = 255
    )
    private String fileName;

    @Column(
            name = "mime_type",
            length = 100
    )
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public User getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(
            User uploadedBy
    ) {
        this.uploadedBy = uploadedBy;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(
            String publicId
    ) {
        this.publicId = publicId;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(
            String url
    ) {
        this.url = url;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(
            String fileName
    ) {
        this.fileName = fileName;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(
            String mimeType
    ) {
        this.mimeType = mimeType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(
            Long fileSize
    ) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}