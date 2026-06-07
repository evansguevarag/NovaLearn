package com.novalearn.learning.enrollment.repository;

import com.novalearn.learning.enrollment.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    boolean existsByStudentIdAndCourseIdAndDeletedAtIsNull(Long studentId, Long courseId);

    Optional<Enrollment> findByIdAndDeletedAtIsNull(Long id);

    List<Enrollment> findByStudentIdAndDeletedAtIsNullOrderByEnrolledAtDesc(Long studentId);

    List<Enrollment> findByCourseIdAndDeletedAtIsNullOrderByEnrolledAtDesc(Long courseId);
}