package com.novalearn.learning.progress.service;

import com.novalearn.learning.enrollment.entity.Enrollment;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.learning.lesson.entity.Lesson;
import com.novalearn.learning.lesson.repository.LessonRepository;
import com.novalearn.learning.progress.dto.LessonProgressRequest;
import com.novalearn.learning.progress.dto.LessonProgressResponse;
import com.novalearn.learning.progress.entity.LessonProgress;
import com.novalearn.learning.progress.repository.LessonProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class LessonProgressService {

    private final LessonProgressRepository progressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;

    public LessonProgressService(
            LessonProgressRepository progressRepository,
            EnrollmentRepository enrollmentRepository,
            LessonRepository lessonRepository
    ) {
        this.progressRepository = progressRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional
    public LessonProgressResponse updateProgress(LessonProgressRequest request) {

        Enrollment enrollment = enrollmentRepository.findByIdAndDeletedAtIsNull(request.getEnrollmentId())
                .orElseThrow(() -> new IllegalArgumentException("Matricula no encontrada"));

        Lesson lesson = lessonRepository.findByIdAndDeletedAtIsNull(request.getLessonId())
                .orElseThrow(() -> new IllegalArgumentException("Leccion no encontrada"));

        if (!lesson.getModule().getCourse().getId().equals(enrollment.getCourse().getId())) {
            throw new IllegalArgumentException("La leccion no pertenece al curso de la matricula");
        }

        LessonProgress progress = progressRepository
                .findByEnrollmentIdAndLessonId(enrollment.getId(), lesson.getId())
                .orElseGet(() -> {
                    LessonProgress newProgress = new LessonProgress();
                    newProgress.setEnrollment(enrollment);
                    newProgress.setLesson(lesson);
                    return newProgress;
                });

        if (Boolean.TRUE.equals(request.getCompleted())) {
            progress.markCompleted();
        } else {
            progress.markPending();
        }

        LessonProgress savedProgress = progressRepository.save(progress);

        updateEnrollmentProgress(enrollment);

        return new LessonProgressResponse(savedProgress);
    }

    @Transactional(readOnly = true)
    public List<LessonProgressResponse> findByEnrollment(Long enrollmentId) {
        return progressRepository.findByEnrollmentIdOrderByLessonSortOrderAsc(enrollmentId)
                .stream()
                .map(LessonProgressResponse::new)
                .toList();
    }

    private void updateEnrollmentProgress(Enrollment enrollment) {

        long totalLessons = lessonRepository.countByModuleCourseIdAndDeletedAtIsNull(
                enrollment.getCourse().getId()
        );

        if (totalLessons == 0) {
            enrollment.setProgressPercentage(BigDecimal.ZERO);
            return;
        }

        long completedLessons = progressRepository.countByEnrollmentIdAndCompletedTrue(
                enrollment.getId()
        );

        BigDecimal progressPercentage = BigDecimal.valueOf(completedLessons)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalLessons), 2, RoundingMode.HALF_UP);

        enrollment.setProgressPercentage(progressPercentage);

        if (progressPercentage.compareTo(BigDecimal.valueOf(100)) == 0) {
            enrollment.complete();
        }
    }
}
