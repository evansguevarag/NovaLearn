package com.novalearn.learning.assignment.repository;

import com.novalearn.learning.assignment.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {

    Optional<AssignmentSubmission> findByAssignmentIdAndStudentIdAndDeletedAtIsNull(
            Long assignmentId,
            Long studentId
    );

    List<AssignmentSubmission> findByAssignmentIdAndDeletedAtIsNullOrderBySubmittedAtDescCreatedAtDesc(
            Long assignmentId
    );
}