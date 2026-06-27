package com.novalearn.learning.lesson.entity;

import com.novalearn.learning.lesson.enums.LessonType;
import com.novalearn.learning.module.entity.CourseModule;
import com.novalearn.media.entity.FileAsset;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "lessons",
        indexes = {
                @Index(
                        name = "idx_lessons_module",
                        columnList = "module_id"
                ),
                @Index(
                        name = "idx_lessons_sort_order",
                        columnList = "sort_order"
                ),
                @Index(
                        name = "idx_lessons_type",
                        columnList = "lesson_type"
                ),
                @Index(
                        name = "idx_lessons_resource_file",
                        columnList = "resource_file_id"
                )
        }
)
public class Lesson {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "module_id",
            nullable = false
    )
    private CourseModule module;

    @Column(
            name = "title",
            nullable = false,
            length = 255
    )
    private String title;

    @Column(
            name = "description",
            columnDefinition = "TEXT"
    )
    private String description;

    @Column(
            name = "content",
            columnDefinition = "TEXT"
    )
    private String content;

    @Column(
            name = "video_url",
            length = 1000
    )
    private String videoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_file_id")
    private FileAsset resourceFile;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "lesson_type",
            nullable = false,
            length = 50
    )
    private LessonType lessonType;

    @Column(
            name = "duration_minutes",
            nullable = false
    )
    private Integer durationMinutes = 0;

    @Column(
            name = "sort_order",
            nullable = false
    )
    private Integer sortOrder = 1;

    @Column(
            name = "is_preview",
            nullable = false
    )
    private Boolean preview = false;

    @Column(
            name = "is_active",
            nullable = false
    )
    private Boolean active = true;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (lessonType == null) {
            lessonType = LessonType.TEXT;
        }

        if (durationMinutes == null) {
            durationMinutes = 0;
        }

        if (sortOrder == null) {
            sortOrder = 1;
        }

        if (preview == null) {
            preview = false;
        }

        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public CourseModule getModule() {
        return module;
    }

    public void setModule(
            CourseModule module
    ) {
        this.module = module;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title
    ) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(
            String content
    ) {
        this.content = content;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(
            String videoUrl
    ) {
        this.videoUrl = videoUrl;
    }

    public FileAsset getResourceFile() {
        return resourceFile;
    }

    public void setResourceFile(
            FileAsset resourceFile
    ) {
        this.resourceFile = resourceFile;
    }

    public void removeResourceFile() {
        this.resourceFile = null;
    }

    public LessonType getLessonType() {
        return lessonType;
    }

    public void setLessonType(
            LessonType lessonType
    ) {
        this.lessonType = lessonType;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(
            Integer durationMinutes
    ) {
        this.durationMinutes =
                durationMinutes;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(
            Integer sortOrder
    ) {
        this.sortOrder = sortOrder;
    }

    public Boolean getPreview() {
        return preview;
    }

    public void setPreview(
            Boolean preview
    ) {
        this.preview = preview;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(
            Boolean active
    ) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void softDelete() {
        deletedAt = LocalDateTime.now();
        active = false;
    }
}