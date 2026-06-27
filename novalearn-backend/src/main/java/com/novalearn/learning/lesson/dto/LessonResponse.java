package com.novalearn.learning.lesson.dto;

import com.novalearn.learning.lesson.entity.Lesson;
import com.novalearn.media.entity.FileAsset;

import java.time.LocalDateTime;

public class LessonResponse {

    private Long id;
    private Long moduleId;
    private String moduleTitle;
    private String title;
    private String description;
    private String content;
    private String videoUrl;
    private String lessonType;
    private Integer durationMinutes;
    private Integer sortOrder;
    private Boolean preview;
    private Boolean active;

    private Long resourceFileId;
    private String resourceUrl;
    private String resourceFileName;
    private String resourceMimeType;
    private Long resourceFileSize;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LessonResponse(
            Lesson lesson
    ) {
        this.id = lesson.getId();
        this.moduleId =
                lesson.getModule().getId();
        this.moduleTitle =
                lesson.getModule().getTitle();
        this.title = lesson.getTitle();
        this.description =
                lesson.getDescription();
        this.content = lesson.getContent();
        this.videoUrl =
                lesson.getVideoUrl();
        this.lessonType =
                lesson.getLessonType().name();
        this.durationMinutes =
                lesson.getDurationMinutes();
        this.sortOrder =
                lesson.getSortOrder();
        this.preview =
                lesson.getPreview();
        this.active =
                lesson.getActive();
        this.createdAt =
                lesson.getCreatedAt();
        this.updatedAt =
                lesson.getUpdatedAt();

        mapResourceFile(
                lesson.getResourceFile()
        );
    }

    private void mapResourceFile(
            FileAsset resourceFile
    ) {
        if (resourceFile == null) {
            return;
        }

        this.resourceFileId =
                resourceFile.getId();
        this.resourceUrl =
                resourceFile.getUrl();
        this.resourceFileName =
                resourceFile.getFileName();
        this.resourceMimeType =
                resourceFile.getMimeType();
        this.resourceFileSize =
                resourceFile.getFileSize();
    }

    public Long getId() {
        return id;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public String getModuleTitle() {
        return moduleTitle;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getContent() {
        return content;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public String getLessonType() {
        return lessonType;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public Boolean getPreview() {
        return preview;
    }

    public Boolean getActive() {
        return active;
    }

    public Long getResourceFileId() {
        return resourceFileId;
    }

    public String getResourceUrl() {
        return resourceUrl;
    }

    public String getResourceFileName() {
        return resourceFileName;
    }

    public String getResourceMimeType() {
        return resourceMimeType;
    }

    public Long getResourceFileSize() {
        return resourceFileSize;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}