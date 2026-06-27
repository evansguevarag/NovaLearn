package com.novalearn.marketplace.service;

import com.novalearn.common.exception.BadRequestException;
import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.enums.CourseStatus;
import com.novalearn.learning.course.enums.CourseType;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.learning.enrollment.dto.EnrollmentResponse;
import com.novalearn.learning.enrollment.entity.Enrollment;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.learning.progress.repository.LessonProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentFreeEnrollmentService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;

    public StudentFreeEnrollmentService(
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            LessonProgressRepository lessonProgressRepository
    ) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.lessonProgressRepository = lessonProgressRepository;
    }

    @Transactional
    public EnrollmentResponse enroll(
            Long courseId,
            User student
    ) {
        validateStudent(student);

        Course course = courseRepository
                .findByIdAndDeletedAtIsNull(courseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Curso no encontrado"
                        )
                );

        validateCourse(course);

        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseId(
                        student.getId(),
                        course.getId()
                )
                .map(this::reactivateEnrollment)
                .orElseGet(() ->
                        createEnrollment(
                                student,
                                course
                        )
                );

        Enrollment savedEnrollment =
                enrollmentRepository.save(enrollment);

        return new EnrollmentResponse(savedEnrollment);
    }

    private Enrollment createEnrollment(
            User student,
            Course course
    ) {
        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);

        return enrollment;
    }

    private Enrollment reactivateEnrollment(
            Enrollment enrollment
    ) {
        if (
                Boolean.TRUE.equals(
                        enrollment.getActive()
                ) &&
                enrollment.getDeletedAt() == null
        ) {
            throw new BadRequestException(
                    "Ya estás matriculado en este curso"
            );
        }

        lessonProgressRepository.deleteByEnrollmentId(
                enrollment.getId()
        );

        enrollment.reactivate();

        return enrollment;
    }

    private void validateStudent(User student) {
        if (
                student == null ||
                student.getRole() != UserRole.STUDENT
        ) {
            throw new BadRequestException(
                    "Solo los estudiantes pueden matricularse"
            );
        }
    }

    private void validateCourse(Course course) {
        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new BadRequestException(
                    "El curso no está disponible para matrícula"
            );
        }

        if (course.getCourseType() != CourseType.FREE) {
            throw new BadRequestException(
                    "Los cursos de pago requieren completar el proceso de compra"
            );
        }
    }
}
