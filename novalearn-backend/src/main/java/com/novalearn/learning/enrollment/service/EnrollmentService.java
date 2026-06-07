package com.novalearn.learning.enrollment.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.core.user.repository.UserRepository;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.learning.enrollment.dto.EnrollmentRequest;
import com.novalearn.learning.enrollment.dto.EnrollmentResponse;
import com.novalearn.learning.enrollment.entity.Enrollment;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            UserRepository userRepository,
            CourseRepository courseRepository
    ) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public EnrollmentResponse create(EnrollmentRequest request) {

        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado"));

        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("El usuario indicado no tiene rol de estudiante");
        }

        Course course = courseRepository.findByIdAndDeletedAtIsNull(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        if (enrollmentRepository.existsByStudentIdAndCourseIdAndDeletedAtIsNull(
                student.getId(),
                course.getId()
        )) {
            throw new IllegalArgumentException("El estudiante ya esta matriculado en este curso");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);

        return new EnrollmentResponse(enrollmentRepository.save(enrollment));
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> findByStudent(Long studentId) {
        return enrollmentRepository.findByStudentIdAndDeletedAtIsNullOrderByEnrolledAtDesc(studentId)
                .stream()
                .map(EnrollmentResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> findByCourse(Long courseId) {
        return enrollmentRepository.findByCourseIdAndDeletedAtIsNullOrderByEnrolledAtDesc(courseId)
                .stream()
                .map(EnrollmentResponse::new)
                .toList();
    }

    @Transactional
    public void delete(Long id) {
        Enrollment enrollment = enrollmentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Matricula no encontrada"));

        enrollment.deactivate();
    }
}