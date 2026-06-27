package com.novalearn.student.learning.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.learning.course.enums.CourseStatus;
import com.novalearn.learning.enrollment.entity.Enrollment;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.learning.lesson.entity.Lesson;
import com.novalearn.learning.lesson.repository.LessonRepository;
import com.novalearn.learning.module.entity.CourseModule;
import com.novalearn.learning.module.repository.CourseModuleRepository;
import com.novalearn.learning.progress.entity.LessonProgress;
import com.novalearn.learning.progress.repository.LessonProgressRepository;
import com.novalearn.student.learning.dto.StudentLearningCourseResponse;
import com.novalearn.student.learning.dto.StudentLearningLessonResponse;
import com.novalearn.student.learning.dto.StudentLearningModuleResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StudentLearningService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;

    public StudentLearningService(
            EnrollmentRepository enrollmentRepository,
            CourseModuleRepository moduleRepository,
            LessonRepository lessonRepository,
            LessonProgressRepository progressRepository
    ) {
        this.enrollmentRepository = enrollmentRepository;
        this.moduleRepository = moduleRepository;
        this.lessonRepository = lessonRepository;
        this.progressRepository = progressRepository;
    }

    @Transactional(readOnly = true)
    public StudentLearningCourseResponse findCourseClassroom(
            Long courseId,
            User student
    ) {
        validateStudent(student);

        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseIdAndActiveTrueAndDeletedAtIsNull(
                        student.getId(),
                        courseId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No tienes una matrícula activa en este curso"
                        )
                );

        if (enrollment.getCourse().getStatus() != CourseStatus.PUBLISHED) {
            throw new IllegalArgumentException(
                    "El curso no se encuentra publicado"
            );
        }

        Map<Long, LessonProgress> progressByLessonId =
                progressRepository
                        .findByEnrollmentIdOrderByLessonSortOrderAsc(
                                enrollment.getId()
                        )
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        progress ->
                                                progress.getLesson().getId(),
                                        Function.identity(),
                                        (first, ignored) -> first
                                )
                        );

        List<CourseModule> activeModules = moduleRepository
                .findByCourseIdAndDeletedAtIsNullOrderBySortOrderAsc(
                        courseId
                )
                .stream()
                .filter(module ->
                        Boolean.TRUE.equals(module.getActive())
                )
                .toList();

        List<StudentLearningModuleResponse> moduleResponses =
                activeModules.stream()
                        .map(module ->
                                mapModule(
                                        module,
                                        progressByLessonId
                                )
                        )
                        .toList();

        int totalLessons = moduleResponses.stream()
                .mapToInt(module ->
                        module.getLessons().size()
                )
                .sum();

        int completedLessons = moduleResponses.stream()
                .flatMap(module ->
                        module.getLessons().stream()
                )
                .mapToInt(lesson ->
                        Boolean.TRUE.equals(
                                lesson.getCompleted()
                        )
                                ? 1
                                : 0
                )
                .sum();

        return new StudentLearningCourseResponse(
                enrollment,
                moduleResponses.size(),
                totalLessons,
                completedLessons,
                moduleResponses
        );
    }

    private StudentLearningModuleResponse mapModule(
            CourseModule module,
            Map<Long, LessonProgress> progressByLessonId
    ) {
        List<StudentLearningLessonResponse> lessons =
                lessonRepository
                        .findByModuleIdAndDeletedAtIsNullOrderBySortOrderAsc(
                                module.getId()
                        )
                        .stream()
                        .filter(lesson ->
                                Boolean.TRUE.equals(lesson.getActive())
                        )
                        .map(lesson ->
                                mapLesson(
                                        lesson,
                                        progressByLessonId
                                )
                        )
                        .toList();

        return new StudentLearningModuleResponse(
                module,
                lessons
        );
    }

    private StudentLearningLessonResponse mapLesson(
            Lesson lesson,
            Map<Long, LessonProgress> progressByLessonId
    ) {
        LessonProgress progress =
                progressByLessonId.get(lesson.getId());

        boolean completed =
                progress != null
                        && Boolean.TRUE.equals(
                                progress.getCompleted()
                        );

        return new StudentLearningLessonResponse(
                lesson,
                completed
        );
    }

    private void validateStudent(User user) {
        if (user == null) {
            throw new IllegalArgumentException(
                    "Usuario no autenticado"
            );
        }

        if (user.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException(
                    "Solo los estudiantes pueden acceder al aula"
            );
        }
    }
}