package com.novalearn.learning.lesson.service;

import com.novalearn.learning.lesson.dto.LessonRequest;
import com.novalearn.learning.lesson.dto.LessonResponse;
import com.novalearn.learning.lesson.entity.Lesson;
import com.novalearn.learning.lesson.enums.LessonType;
import com.novalearn.learning.lesson.repository.LessonRepository;
import com.novalearn.learning.module.entity.CourseModule;
import com.novalearn.learning.module.repository.CourseModuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseModuleRepository moduleRepository;

    public LessonService(
            LessonRepository lessonRepository,
            CourseModuleRepository moduleRepository
    ) {
        this.lessonRepository = lessonRepository;
        this.moduleRepository = moduleRepository;
    }

    @Transactional
    public LessonResponse create(LessonRequest request) {

        CourseModule module = moduleRepository.findByIdAndDeletedAtIsNull(request.getModuleId())
                .orElseThrow(() -> new IllegalArgumentException("Modulo no encontrado"));

        Lesson lesson = new Lesson();
        lesson.setModule(module);
        lesson.setTitle(request.getTitle().trim());
        lesson.setDescription(request.getDescription());
        lesson.setContent(request.getContent());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setLessonType(request.getLessonType() != null ? request.getLessonType() : LessonType.TEXT);
        lesson.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 0);
        lesson.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 1);
        lesson.setPreview(request.getPreview() != null ? request.getPreview() : false);
        lesson.setActive(request.getActive() != null ? request.getActive() : true);

        return new LessonResponse(lessonRepository.save(lesson));
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> findByModule(Long moduleId) {
        return lessonRepository.findByModuleIdAndDeletedAtIsNullOrderBySortOrderAsc(moduleId)
                .stream()
                .map(LessonResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public LessonResponse findById(Long id) {
        Lesson lesson = lessonRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Leccion no encontrada"));

        return new LessonResponse(lesson);
    }

    @Transactional
    public LessonResponse update(Long id, LessonRequest request) {
        Lesson lesson = lessonRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Leccion no encontrada"));

        CourseModule module = moduleRepository.findByIdAndDeletedAtIsNull(request.getModuleId())
                .orElseThrow(() -> new IllegalArgumentException("Modulo no encontrado"));

        lesson.setModule(module);
        lesson.setTitle(request.getTitle().trim());
        lesson.setDescription(request.getDescription());
        lesson.setContent(request.getContent());
        lesson.setVideoUrl(request.getVideoUrl());

        if (request.getLessonType() != null) {
            lesson.setLessonType(request.getLessonType());
        }

        if (request.getDurationMinutes() != null) {
            lesson.setDurationMinutes(request.getDurationMinutes());
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

        return new LessonResponse(lesson);
    }

    @Transactional
    public void delete(Long id) {
        Lesson lesson = lessonRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Leccion no encontrada"));

        lesson.softDelete();
    }
}
