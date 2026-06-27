package com.novalearn.learning.assignment.service;

import com.novalearn.common.exception.BadRequestException;
import com.novalearn.common.exception.ForbiddenActionException;
import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.instructor.security.service.InstructorContentAccessService;
import com.novalearn.learning.assignment.dto.*;
import com.novalearn.learning.assignment.entity.Assignment;
import com.novalearn.learning.assignment.entity.AssignmentSubmission;
import com.novalearn.learning.assignment.enums.AssignmentStatus;
import com.novalearn.learning.assignment.enums.AssignmentSubmissionStatus;
import com.novalearn.learning.assignment.repository.AssignmentRepository;
import com.novalearn.learning.assignment.repository.AssignmentSubmissionRepository;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.learning.module.entity.CourseModule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final InstructorContentAccessService accessService;

    public AssignmentService(
            AssignmentRepository assignmentRepository,
            AssignmentSubmissionRepository submissionRepository,
            EnrollmentRepository enrollmentRepository,
            InstructorContentAccessService accessService
    ) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.accessService = accessService;
    }

    @Transactional
    public AssignmentResponse create(AssignmentRequest request, User user) {
        validateManager(user);
        CourseModule module = accessService.getAccessibleModule(request.getModuleId(), user);

        Assignment assignment = new Assignment();
        assignment.setModule(module);
        assignment.setCreatedBy(user);
        applyRequest(assignment, request);

        return new AssignmentResponse(assignmentRepository.save(assignment));
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> findManagedByCourse(Long courseId, User user) {
        validateManager(user);
        accessService.getAccessibleCourse(courseId, user);

        return assignmentRepository
                .findByModuleCourseIdAndDeletedAtIsNullOrderByModuleSortOrderAscDueAtAscCreatedAtAsc(courseId)
                .stream()
                .map(AssignmentResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public AssignmentResponse findManagedById(Long assignmentId, User user) {
        return new AssignmentResponse(findManagedAssignment(assignmentId, user));
    }

    @Transactional
    public AssignmentResponse update(Long assignmentId, AssignmentRequest request, User user) {
        Assignment assignment = findManagedAssignment(assignmentId, user);
        CourseModule targetModule = accessService.getAccessibleModule(request.getModuleId(), user);

        if (!assignment.getModule().getCourse().getId().equals(targetModule.getCourse().getId())) {
            throw new BadRequestException("No se puede mover la tarea a otro curso");
        }

        assignment.setModule(targetModule);
        applyRequest(assignment, request);

        return new AssignmentResponse(assignmentRepository.save(assignment));
    }

    @Transactional
    public void delete(Long assignmentId, User user) {
        Assignment assignment = findManagedAssignment(assignmentId, user);
        assignment.softDelete();
        assignmentRepository.save(assignment);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> findPublishedForStudent(Long courseId, User student) {
        validateStudentEnrollment(courseId, student);
        LocalDateTime now = LocalDateTime.now();

        return assignmentRepository
                .findByModuleCourseIdAndStatusAndDeletedAtIsNullOrderByModuleSortOrderAscDueAtAscCreatedAtAsc(
                        courseId,
                        AssignmentStatus.PUBLISHED
                )
                .stream()
                .filter(assignment -> assignment.getAvailableFrom() == null || !assignment.getAvailableFrom().isAfter(now))
                .map(AssignmentResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public AssignmentResponse findPublishedForStudentById(Long assignmentId, User student) {
        Assignment assignment = findAssignment(assignmentId);
        validateStudentEnrollment(assignment.getModule().getCourse().getId(), student);
        validatePublishedAndAvailable(assignment);
        return new AssignmentResponse(assignment);
    }

    @Transactional
    public AssignmentSubmissionResponse saveStudentSubmission(
            Long assignmentId,
            AssignmentSubmissionRequest request,
            User student
    ) {
        Assignment assignment = findAssignment(assignmentId);
        validateStudentEnrollment(assignment.getModule().getCourse().getId(), student);
        validatePublishedAndAvailable(assignment);

        AssignmentSubmission submission = submissionRepository
                .findByAssignmentIdAndStudentIdAndDeletedAtIsNull(assignmentId, student.getId())
                .orElseGet(() -> {
                    AssignmentSubmission created = new AssignmentSubmission();
                    created.setAssignment(assignment);
                    created.setStudent(student);
                    return created;
                });

        if (submission.getStatus() == AssignmentSubmissionStatus.GRADED) {
            throw new BadRequestException("La entrega ya fue calificada y no puede modificarse");
        }

        String text = normalizeNullableText(request.getSubmissionText());

        if (text != null && !Boolean.TRUE.equals(assignment.getAllowTextSubmission())) {
            throw new BadRequestException("Esta tarea no permite entregas de texto");
        }

        submission.setSubmissionText(text);

        if (Boolean.TRUE.equals(request.getSubmit())) {
            if (text == null) {
                throw new BadRequestException("Debes escribir una respuesta antes de enviar la tarea");
            }

            boolean late = assignment.getDueAt() != null && LocalDateTime.now().isAfter(assignment.getDueAt());
            submission.submit(late);
        }

        return new AssignmentSubmissionResponse(submissionRepository.save(submission));
    }

    @Transactional(readOnly = true)
    public AssignmentSubmissionResponse findMySubmission(Long assignmentId, User student) {
        Assignment assignment = findAssignment(assignmentId);
        validateStudentEnrollment(assignment.getModule().getCourse().getId(), student);

        AssignmentSubmission submission = submissionRepository
                .findByAssignmentIdAndStudentIdAndDeletedAtIsNull(assignmentId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Todavía no existe una entrega para esta tarea"));

        return new AssignmentSubmissionResponse(submission);
    }

    @Transactional(readOnly = true)
    public List<AssignmentSubmissionResponse> findSubmissions(Long assignmentId, User user) {
        findManagedAssignment(assignmentId, user);

        return submissionRepository
                .findByAssignmentIdAndDeletedAtIsNullOrderBySubmittedAtDescCreatedAtDesc(assignmentId)
                .stream()
                .map(AssignmentSubmissionResponse::new)
                .toList();
    }

    @Transactional
    public AssignmentSubmissionResponse grade(
            Long submissionId,
            AssignmentGradeRequest request,
            User user
    ) {
        validateManager(user);

        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada"));

        accessService.getAccessibleCourse(
                submission.getAssignment().getModule().getCourse().getId(),
                user
        );

        if (submission.getStatus() == AssignmentSubmissionStatus.DRAFT) {
            throw new BadRequestException("No se puede calificar una entrega en borrador");
        }

        if (request.getScore().compareTo(submission.getAssignment().getMaxScore()) > 0) {
            throw new BadRequestException("La calificación no puede superar el puntaje máximo de la tarea");
        }

        submission.grade(
                request.getScore(),
                normalizeNullableText(request.getFeedback()),
                user
        );

        return new AssignmentSubmissionResponse(submissionRepository.save(submission));
    }

    private Assignment findManagedAssignment(Long assignmentId, User user) {
        validateManager(user);
        Assignment assignment = findAssignment(assignmentId);
        accessService.getAccessibleCourse(assignment.getModule().getCourse().getId(), user);
        return assignment;
    }

    private Assignment findAssignment(Long assignmentId) {
        return assignmentRepository.findByIdAndDeletedAtIsNull(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada"));
    }

    private void applyRequest(Assignment assignment, AssignmentRequest request) {
        if (
                request.getAvailableFrom() != null &&
                request.getDueAt() != null &&
                !request.getDueAt().isAfter(request.getAvailableFrom())
        ) {
            throw new BadRequestException("La fecha límite debe ser posterior a la fecha de apertura");
        }

        boolean allowText = request.getAllowTextSubmission() == null || request.getAllowTextSubmission();
        boolean allowFile = request.getAllowFileSubmission() == null || request.getAllowFileSubmission();

        if (!allowText && !allowFile) {
            throw new BadRequestException("La tarea debe permitir al menos un tipo de entrega");
        }

        assignment.setTitle(request.getTitle().trim());
        assignment.setInstructions(request.getInstructions().trim());
        assignment.setAvailableFrom(request.getAvailableFrom());
        assignment.setDueAt(request.getDueAt());
        assignment.setMaxScore(request.getMaxScore() != null ? request.getMaxScore() : BigDecimal.valueOf(20));
        assignment.setAllowTextSubmission(allowText);
        assignment.setAllowFileSubmission(allowFile);

        AssignmentStatus targetStatus = request.getStatus() != null
                ? request.getStatus()
                : AssignmentStatus.DRAFT;

        switch (targetStatus) {
            case PUBLISHED -> assignment.publish();
            case CLOSED -> assignment.close();
            case DRAFT -> assignment.moveToDraft();
        }
    }

    private void validateManager(User user) {
        if (user == null) {
            throw new ForbiddenActionException("No se pudo identificar al usuario autenticado");
        }

        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.INSTRUCTOR) {
            throw new ForbiddenActionException("No tienes permiso para administrar tareas");
        }
    }

    private void validateStudentEnrollment(Long courseId, User student) {
        if (student == null || student.getRole() != UserRole.STUDENT) {
            throw new ForbiddenActionException("Solo los estudiantes pueden acceder a este recurso");
        }

        enrollmentRepository
                .findByStudentIdAndCourseIdAndActiveTrueAndDeletedAtIsNull(student.getId(), courseId)
                .orElseThrow(() -> new ForbiddenActionException("No tienes una matrícula activa en este curso"));
    }

    private void validatePublishedAndAvailable(Assignment assignment) {
        if (assignment.getStatus() != AssignmentStatus.PUBLISHED) {
            throw new ResourceNotFoundException("La tarea no está publicada");
        }

        if (assignment.getAvailableFrom() != null && assignment.getAvailableFrom().isAfter(LocalDateTime.now())) {
            throw new ForbiddenActionException("La tarea todavía no está disponible");
        }
    }

    private String normalizeNullableText(String value) {
        if (value == null) return null;
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}