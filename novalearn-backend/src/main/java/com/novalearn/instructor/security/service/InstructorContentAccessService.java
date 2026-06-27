package com.novalearn.instructor.security.service;

import com.novalearn.common.exception.ForbiddenActionException;
import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.learning.lesson.entity.Lesson;
import com.novalearn.learning.lesson.repository.LessonRepository;
import com.novalearn.learning.module.entity.CourseModule;
import com.novalearn.learning.module.repository.CourseModuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InstructorContentAccessService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;

    public InstructorContentAccessService(
            CourseRepository courseRepository,
            CourseModuleRepository moduleRepository,
            LessonRepository lessonRepository
    ) {
        this.courseRepository = courseRepository;
        this.moduleRepository = moduleRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional(readOnly = true)
    public Course getAccessibleCourse(
            Long courseId,
            User authenticatedUser
    ) {
        validateAuthenticatedUser(authenticatedUser);

        Course course = courseRepository
                .findByIdAndDeletedAtIsNull(courseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Curso no encontrado"
                        )
                );

        validateCourseOwnership(course, authenticatedUser);

        return course;
    }

    @Transactional(readOnly = true)
    public CourseModule getAccessibleModule(
            Long moduleId,
            User authenticatedUser
    ) {
        validateAuthenticatedUser(authenticatedUser);

        CourseModule module = moduleRepository
                .findByIdAndDeletedAtIsNull(moduleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Módulo no encontrado"
                        )
                );

        validateCourseOwnership(
                module.getCourse(),
                authenticatedUser
        );

        return module;
    }

    @Transactional(readOnly = true)
    public Lesson getAccessibleLesson(
            Long lessonId,
            User authenticatedUser
    ) {
        validateAuthenticatedUser(authenticatedUser);

        Lesson lesson = lessonRepository
                .findByIdAndDeletedAtIsNull(lessonId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Lección no encontrada"
                        )
                );

        validateCourseOwnership(
                lesson.getModule().getCourse(),
                authenticatedUser
        );

        return lesson;
    }

    public void validateCourseOwnership(
            Course course,
            User authenticatedUser
    ) {
        validateAuthenticatedUser(authenticatedUser);

        if (authenticatedUser.getRole() == UserRole.ADMIN) {
            return;
        }

        Long courseInstructorId =
                course.getInstructor().getId();

        if (!courseInstructorId.equals(
                authenticatedUser.getId()
        )) {
            throw new ForbiddenActionException(
                    "No tienes permiso para administrar este curso"
            );
        }
    }

    private void validateAuthenticatedUser(
            User authenticatedUser
    ) {
        if (authenticatedUser == null) {
            throw new ForbiddenActionException(
                    "No se pudo identificar al usuario autenticado"
            );
        }

        UserRole role = authenticatedUser.getRole();

        if (
                role != UserRole.ADMIN &&
                role != UserRole.INSTRUCTOR
        ) {
            throw new ForbiddenActionException(
                    "Solo administradores o instructores pueden administrar contenido académico"
            );
        }
    }
}
