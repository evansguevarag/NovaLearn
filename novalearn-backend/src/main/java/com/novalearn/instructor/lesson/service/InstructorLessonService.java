package com.novalearn.instructor.lesson.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.instructor.security.service.InstructorContentAccessService;
import com.novalearn.learning.lesson.dto.LessonRequest;
import com.novalearn.learning.lesson.dto.LessonResponse;
import com.novalearn.learning.lesson.entity.Lesson;
import com.novalearn.learning.lesson.enums.LessonType;
import com.novalearn.learning.lesson.repository.LessonRepository;
import com.novalearn.learning.module.entity.CourseModule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InstructorLessonService {

    private final LessonRepository lessonRepository;
    private final InstructorContentAccessService accessService;

    public InstructorLessonService(
            LessonRepository lessonRepository,
            InstructorContentAccessService accessService
    ) {
        this.lessonRepository = lessonRepository;
        this.accessService = accessService;
    }

    @Transactional
    public LessonResponse create(
            LessonRequest request,
            User authenticatedUser
    ) {
        CourseModule module = accessService.getAccessibleModule(
                request.getModuleId(),
                authenticatedUser
        );

        Lesson lesson = new Lesson();
        lesson.setModule(module);
        lesson.setTitle(request.getTitle().trim());
        lesson.setDescription(
                normalizeNullableText(request.getDescription())
        );
        lesson.setContent(
                normalizeNullableText(request.getContent())
        );
        lesson.setVideoUrl(
                normalizeNullableText(request.getVideoUrl())
        );
        lesson.setLessonType(
                request.getLessonType() != null
                        ? request.getLessonType()
                        : LessonType.TEXT
        );
        lesson.setDurationMinutes(
                request.getDurationMinutes() != null
                        ? request.getDurationMinutes()
                        : 0
        );
        lesson.setSortOrder(
                request.getSortOrder() != null
                        ? request.getSortOrder()
                        : 1
        );
        lesson.setPreview(
                request.getPreview() != null
                        ? request.getPreview()
                        : false
        );
        lesson.setActive(
                request.getActive() != null
                        ? request.getActive()
                        : true
        );

        Lesson savedLesson = lessonRepository.save(lesson);

        return new LessonResponse(savedLesson);
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> findByModule(
            Long moduleId,
            User authenticatedUser
    ) {
        accessService.getAccessibleModule(
                moduleId,
                authenticatedUser
        );

        return lessonRepository
                .findByModuleIdAndDeletedAtIsNullOrderBySortOrderAsc(
                        moduleId
                )
                .stream()
                .map(LessonResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public LessonResponse findById(
            Long lessonId,
            User authenticatedUser
    ) {
        Lesson lesson = accessService.getAccessibleLesson(
                lessonId,
                authenticatedUser
        );

        return new LessonResponse(lesson);
    }

    @Transactional
    public LessonResponse update(
            Long lessonId,
            LessonRequest request,
            User authenticatedUser
    ) {
        Lesson lesson = accessService.getAccessibleLesson(
                lessonId,
                authenticatedUser
        );

        CourseModule targetModule =
                accessService.getAccessibleModule(
                        request.getModuleId(),
                        authenticatedUser
                );

        lesson.setModule(targetModule);
        lesson.setTitle(request.getTitle().trim());
        lesson.setDescription(
                normalizeNullableText(request.getDescription())
        );
        lesson.setContent(
                normalizeNullableText(request.getContent())
        );
        lesson.setVideoUrl(
                normalizeNullableText(request.getVideoUrl())
        );

        if (request.getLessonType() != null) {
            lesson.setLessonType(request.getLessonType());
        }

        if (request.getDurationMinutes() != null) {
            lesson.setDurationMinutes(
                    request.getDurationMinutes()
            );
        }

        if (request.getSortOrder() != null) {
            lesson.setSortOrder(request.getSortOrder());
        }

        if (request.getPreview() != null) {
            lesson.setPreview(request.getPreview());
        }

        if (request.getActive() != null) {
            lesson.setActive(request.getActive());
        }

        Lesson updatedLesson =
                lessonRepository.save(lesson);

        return new LessonResponse(updatedLesson);
    }

    @Transactional
    public void delete(
            Long lessonId,
            User authenticatedUser
    ) {
        Lesson lesson = accessService.getAccessibleLesson(
                lessonId,
                authenticatedUser
        );

        lesson.softDelete();
        lessonRepository.save(lesson);
    }

    private String normalizeNullableText(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();

        return normalizedValue.isEmpty()
                ? null
                : normalizedValue;
    }
}
