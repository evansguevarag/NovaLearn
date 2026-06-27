package com.novalearn.student.learning.dto;

import com.novalearn.learning.lesson.entity.Lesson;
import com.novalearn.media.entity.FileAsset;

public class StudentLearningLessonResponse {

    private final Long id;
    private final Long moduleId;
    private final String title;
    private final String description;
    private final String content;
    private final String videoUrl;
    private final String lessonType;
    private final Integer durationMinutes;
    private final Integer sortOrder;
    private final Boolean preview;
    private final Boolean completed;

    private final Long resourceFileId;
    private final String resourceUrl;
    private final String resourceFileName;
    private final String resourceMimeType;
    private final Long resourceFileSize;

    public StudentLearningLessonResponse(
            Lesson lesson,
            boolean completed
    ) {
        this.id = lesson.getId();
        this.moduleId = lesson.getModule().getId();
        this.title = lesson.getTitle();
        this.description = lesson.getDescription();
        this.content = lesson.getContent();
        this.videoUrl = lesson.getVideoUrl();
        this.lessonType = lesson.getLessonType().name();
        this.durationMinutes = lesson.getDurationMinutes();
        this.sortOrder = lesson.getSortOrder();
        this.preview = lesson.getPreview();
        this.completed = completed;

        FileAsset resourceFile = lesson.getResourceFile();

        if (resourceFile == null) {
            this.resourceFileId = null;
            this.resourceUrl = null;
            this.resourceFileName = null;
            this.resourceMimeType = null;
            this.resourceFileSize = null;
        } else {
            this.resourceFileId = resourceFile.getId();
            this.resourceUrl = resourceFile.getUrl();
            this.resourceFileName = resourceFile.getFileName();
            this.resourceMimeType = resourceFile.getMimeType();
            this.resourceFileSize = resourceFile.getFileSize();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getModuleId() {
        return moduleId;
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

    public Boolean getCompleted() {
        return completed;
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
}