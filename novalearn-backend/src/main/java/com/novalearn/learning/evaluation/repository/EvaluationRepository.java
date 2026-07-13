package com.novalearn.learning.evaluation.repository;

import com.novalearn.learning.evaluation.entity.Evaluation;
import com.novalearn.learning.evaluation.enums.EvaluationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    Optional<Evaluation> findByIdAndDeletedAtIsNull(Long id);

    List<Evaluation>
    findByModuleCourseIdAndDeletedAtIsNullOrderByModuleSortOrderAscDueAtAscCreatedAtAsc(
            Long courseId
    );

    List<Evaluation>
    findByModuleCourseIdAndStatusAndDeletedAtIsNullOrderByModuleSortOrderAscDueAtAscCreatedAtAsc(
            Long courseId,
            EvaluationStatus status
    );

    @Query("""
            select e
            from Evaluation e
            join e.module m
            join m.course c
            join Enrollment en on en.course.id = c.id
            where en.student.id = :studentId
                and en.deletedAt is null
                and en.active = true
                and e.status = :status
                and e.deletedAt is null
            order by c.title asc, m.sortOrder asc, e.dueAt asc, e.createdAt asc
            """)
    List<Evaluation> findVisibleByStudentIdAndStatus(
            Long studentId,
            EvaluationStatus status
    );
}
