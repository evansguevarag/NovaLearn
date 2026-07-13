package com.novalearn.learning.enrollment.repository;

import com.novalearn.learning.enrollment.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository
        extends JpaRepository<Enrollment, Long> {

    boolean existsByStudentIdAndCourseIdAndDeletedAtIsNull(
            Long studentId,
            Long courseId
    );

    Optional<Enrollment> findByStudentIdAndCourseId(
            Long studentId,
            Long courseId
    );

    Optional<Enrollment>
    findByStudentIdAndCourseIdAndActiveTrueAndDeletedAtIsNull(
            Long studentId,
            Long courseId
    );

    Optional<Enrollment> findByIdAndDeletedAtIsNull(
            Long id
    );

    List<Enrollment>
    findByStudentIdAndDeletedAtIsNullOrderByEnrolledAtDesc(
            Long studentId
    );

    List<Enrollment>
    findByCourseIdAndDeletedAtIsNullOrderByEnrolledAtDesc(
            Long courseId
    );

    List<Enrollment>
    findTop10ByDeletedAtIsNullOrderByEnrolledAtDesc();

    long countByDeletedAtIsNull();

    long countByCompletedAtIsNotNullAndDeletedAtIsNull();

    List<Enrollment>
    findByCourseInstructorIdAndDeletedAtIsNullOrderByEnrolledAtDesc(
            Long instructorId
    );

    long countByCourseInstructorIdAndDeletedAtIsNull(
            Long instructorId
    );

    long
    countByCourseInstructorIdAndCompletedAtIsNotNullAndDeletedAtIsNull(
            Long instructorId
    );

    @Query(
            value = """
                    SELECT
                        MIN(c.id) AS course_id,
                        c.title,
                        COUNT(e.id) AS total_enrollments
                    FROM enrollments e
                    INNER JOIN courses c
                        ON c.id = e.course_id
                    WHERE e.deleted_at IS NULL
                    GROUP BY c.title
                    ORDER BY total_enrollments DESC
                    LIMIT 5
                    """,
            nativeQuery = true
    )
    List<Object[]> findTopCoursesByEnrollments();
}
