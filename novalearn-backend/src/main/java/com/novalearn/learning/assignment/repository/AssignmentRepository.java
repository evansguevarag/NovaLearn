package com.novalearn.learning.assignment.repository;

import com.novalearn.learning.assignment.entity.Assignment;
import com.novalearn.learning.assignment.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    Optional<Assignment> findByIdAndDeletedAtIsNull(Long id);

    List<Assignment> findByModuleCourseIdAndDeletedAtIsNullOrderByModuleSortOrderAscDueAtAscCreatedAtAsc(
            Long courseId
    );

    List<Assignment> findByModuleCourseIdAndStatusAndDeletedAtIsNullOrderByModuleSortOrderAscDueAtAscCreatedAtAsc(
            Long courseId,
            AssignmentStatus status
    );
}