package com.novalearn.learning.evaluation.service;

import com.novalearn.common.exception.BadRequestException;
import com.novalearn.common.exception.ForbiddenActionException;
import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.instructor.security.service.InstructorContentAccessService;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.learning.evaluation.dto.EvaluationRequest;
import com.novalearn.learning.evaluation.dto.EvaluationResponse;
import com.novalearn.learning.evaluation.entity.Evaluation;
import com.novalearn.learning.evaluation.enums.EvaluationDeliveryMode;
import com.novalearn.learning.evaluation.enums.EvaluationStatus;
import com.novalearn.learning.evaluation.repository.EvaluationRepository;
import com.novalearn.learning.module.entity.CourseModule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final InstructorContentAccessService accessService;

    public EvaluationService(
            EvaluationRepository evaluationRepository,
            EnrollmentRepository enrollmentRepository,
            InstructorContentAccessService accessService
    ) {
        this.evaluationRepository = evaluationRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.accessService = accessService;
    }

    @Transactional
    public EvaluationResponse create(
            EvaluationRequest request,
            User user
    ) {
        validateManager(user);

        CourseModule module =
                accessService.getAccessibleModule(
                        request.getModuleId(),
                        user
                );

        Evaluation evaluation = new Evaluation();
        evaluation.setModule(module);
        evaluation.setCreatedBy(user);

        applyRequest(evaluation, request);

        return new EvaluationResponse(
                evaluationRepository.save(evaluation)
        );
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> findManagedByCourse(
            Long courseId,
            User user
    ) {
        validateManager(user);
        accessService.getAccessibleCourse(courseId, user);

        return evaluationRepository
                .findByModuleCourseIdAndDeletedAtIsNullOrderByModuleSortOrderAscDueAtAscCreatedAtAsc(
                        courseId
                )
                .stream()
                .map(EvaluationResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public EvaluationResponse findManagedById(
            Long evaluationId,
            User user
    ) {
        return new EvaluationResponse(
                findManagedEvaluation(evaluationId, user)
        );
    }

    @Transactional
    public EvaluationResponse update(
            Long evaluationId,
            EvaluationRequest request,
            User user
    ) {
        Evaluation evaluation =
                findManagedEvaluation(
                        evaluationId,
                        user
                );

        CourseModule module =
                accessService.getAccessibleModule(
                        request.getModuleId(),
                        user
                );

        if (
                !module.getCourse().getId().equals(
                        evaluation.getModule()
                                .getCourse()
                                .getId()
                )
        ) {
            throw new BadRequestException(
                    "No puedes mover la evaluación a otro curso"
            );
        }

        evaluation.setModule(module);
        applyRequest(evaluation, request);

        return new EvaluationResponse(
                evaluationRepository.save(evaluation)
        );
    }

    @Transactional
    public void delete(
            Long evaluationId,
            User user
    ) {
        Evaluation evaluation =
                findManagedEvaluation(
                        evaluationId,
                        user
                );

        evaluation.softDelete();
        evaluationRepository.save(evaluation);
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> findPublishedForStudent(
            Long courseId,
            User student
    ) {
        validateStudentEnrollment(courseId, student);

        LocalDateTime now = LocalDateTime.now();

        return evaluationRepository
                .findByModuleCourseIdAndStatusAndDeletedAtIsNullOrderByModuleSortOrderAscDueAtAscCreatedAtAsc(
                        courseId,
                        EvaluationStatus.PUBLISHED
                )
                .stream()
                .filter(
                        evaluation ->
                                Boolean.TRUE.equals(
                                        evaluation.getVisibleInContent()
                                )
                )
                .filter(
                        evaluation ->
                                evaluation.getAvailableFrom() == null
                                        || !evaluation.getAvailableFrom().isAfter(now)
                )
                .map(EvaluationResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public EvaluationResponse findPublishedForStudentById(
            Long evaluationId,
            User student
    ) {
        Evaluation evaluation =
                findEvaluation(evaluationId);

        validateStudentEnrollment(
                evaluation.getModule()
                        .getCourse()
                        .getId(),
                student
        );

        validatePublishedAndAvailable(evaluation);

        return new EvaluationResponse(evaluation);
    }

    private Evaluation findManagedEvaluation(
            Long evaluationId,
            User user
    ) {
        validateManager(user);

        Evaluation evaluation =
                findEvaluation(evaluationId);

        accessService.getAccessibleCourse(
                evaluation.getModule()
                        .getCourse()
                        .getId(),
                user
        );

        return evaluation;
    }

    private Evaluation findEvaluation(
            Long evaluationId
    ) {
        return evaluationRepository
                .findByIdAndDeletedAtIsNull(
                        evaluationId
                )
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Evaluación no encontrada"
                        )
                );
    }

    private void applyRequest(
            Evaluation evaluation,
            EvaluationRequest request
    ) {
        validateDates(request);
        validateScores(request);
        validateDeliveryConfiguration(request);

        BigDecimal maxScore =
                request.getMaxScore() != null
                        ? request.getMaxScore()
                        : BigDecimal.valueOf(20);

        evaluation.setTitle(
                request.getTitle().trim()
        );

        evaluation.setDescription(
                normalizeNullableText(
                        request.getDescription()
                )
        );

        evaluation.setInstructions(
                normalizeNullableText(
                        request.getInstructions()
                )
        );

        evaluation.setEvaluationType(
                request.getEvaluationType()
        );

        evaluation.setDeliveryMode(
                request.getDeliveryMode()
        );

        evaluation.setAvailableFrom(
                request.getAvailableFrom()
        );

        evaluation.setDueAt(
                request.getDueAt()
        );

        evaluation.setTimeLimitMinutes(
                usesOnlineQuiz(request.getDeliveryMode())
                        ? request.getTimeLimitMinutes()
                        : null
        );

        evaluation.setMaxAttempts(
                request.getMaxAttempts() != null
                        ? request.getMaxAttempts()
                        : 1
        );

        evaluation.setMaxScore(maxScore);
        evaluation.setPassingScore(
                request.getPassingScore()
        );

        evaluation.setShuffleQuestions(
                usesOnlineQuiz(request.getDeliveryMode())
                        && Boolean.TRUE.equals(
                        request.getShuffleQuestions()
                )
        );

        evaluation.setShowResults(
                request.getShowResults() == null
                        || request.getShowResults()
        );

        evaluation.setShowCorrectAnswers(
                usesOnlineQuiz(request.getDeliveryMode())
                        && Boolean.TRUE.equals(
                        request.getShowCorrectAnswers()
                )
        );

        evaluation.setAllowLateSubmission(
                usesSubmission(request.getDeliveryMode())
                        && Boolean.TRUE.equals(
                        request.getAllowLateSubmission()
                )
        );

        evaluation.setMaxFiles(
                acceptsFiles(request.getDeliveryMode())
                        ? valueOrDefault(
                        request.getMaxFiles(),
                        1
                )
                        : null
        );

        evaluation.setMaxFileSizeMb(
                acceptsFiles(request.getDeliveryMode())
                        ? valueOrDefault(
                        request.getMaxFileSizeMb(),
                        20
                )
                        : null
        );

        evaluation.setAllowedFileExtensions(
                acceptsFiles(request.getDeliveryMode())
                        ? normalizeExtensions(
                        request.getAllowedFileExtensions()
                )
                        : null
        );

        evaluation.setVisibleInContent(
                request.getVisibleInContent() == null
                        || request.getVisibleInContent()
        );

        evaluation.setSortOrder(
                valueOrDefault(
                        request.getSortOrder(),
                        1
                )
        );

        EvaluationStatus targetStatus =
                request.getStatus() != null
                        ? request.getStatus()
                        : EvaluationStatus.DRAFT;

        switch (targetStatus) {
            case PUBLISHED -> evaluation.publish();
            case CLOSED -> evaluation.close();
            case DRAFT -> evaluation.moveToDraft();
        }
    }

    private void validateDates(
            EvaluationRequest request
    ) {
        if (
                request.getAvailableFrom() != null
                        && request.getDueAt() != null
                        && !request.getDueAt().isAfter(
                        request.getAvailableFrom()
                )
        ) {
            throw new BadRequestException(
                    "La fecha límite debe ser posterior a la fecha de apertura"
            );
        }
    }

    private void validateScores(
            EvaluationRequest request
    ) {
        BigDecimal maxScore =
                request.getMaxScore() != null
                        ? request.getMaxScore()
                        : BigDecimal.valueOf(20);

        BigDecimal passingScore =
                request.getPassingScore();

        if (
                passingScore != null
                        && passingScore.compareTo(
                        maxScore
                ) > 0
        ) {
            throw new BadRequestException(
                    "El puntaje aprobatorio no puede superar el puntaje máximo"
            );
        }
    }

    private void validateDeliveryConfiguration(
            EvaluationRequest request
    ) {
        EvaluationDeliveryMode mode =
                request.getDeliveryMode();

        if (mode == null) {
            throw new BadRequestException(
                    "La modalidad de evaluación es obligatoria"
            );
        }

        if (
                usesOnlineQuiz(mode)
                        && request.getMaxAttempts() != null
                        && request.getMaxAttempts() < 1
        ) {
            throw new BadRequestException(
                    "El cuestionario debe permitir al menos un intento"
            );
        }

        if (
                acceptsFiles(mode)
                        && request.getMaxFiles() != null
                        && request.getMaxFiles() < 1
        ) {
            throw new BadRequestException(
                    "La cantidad máxima de archivos debe ser mayor que cero"
            );
        }
    }

    private boolean usesOnlineQuiz(
            EvaluationDeliveryMode mode
    ) {
        return mode == EvaluationDeliveryMode.ONLINE_QUIZ;
    }

    private boolean usesSubmission(
            EvaluationDeliveryMode mode
    ) {
        return mode == EvaluationDeliveryMode.TEXT_SUBMISSION
                || mode == EvaluationDeliveryMode.FILE_SUBMISSION
                || mode == EvaluationDeliveryMode.HYBRID;
    }

    private boolean acceptsFiles(
            EvaluationDeliveryMode mode
    ) {
        return mode == EvaluationDeliveryMode.FILE_SUBMISSION
                || mode == EvaluationDeliveryMode.HYBRID;
    }

    private int valueOrDefault(
            Integer value,
            int defaultValue
    ) {
        return value != null
                ? value
                : defaultValue;
    }

    private String normalizeExtensions(
            String value
    ) {
        String normalized =
                normalizeNullableText(value);

        return normalized != null
                ? normalized.toLowerCase()
                : "pdf,doc,docx,xls,xlsx,ppt,pptx,zip,jpg,jpeg,png";
    }

    private void validateManager(User user) {
        if (user == null) {
            throw new ForbiddenActionException(
                    "No se pudo identificar al usuario autenticado"
            );
        }

        if (
                user.getRole() != UserRole.ADMIN
                        && user.getRole() != UserRole.INSTRUCTOR
        ) {
            throw new ForbiddenActionException(
                    "No tienes permiso para administrar evaluaciones"
            );
        }
    }

    private void validateStudentEnrollment(
            Long courseId,
            User student
    ) {
        if (
                student == null
                        || student.getRole() != UserRole.STUDENT
        ) {
            throw new ForbiddenActionException(
                    "Solo los estudiantes pueden acceder a este recurso"
            );
        }

        enrollmentRepository
                .findByStudentIdAndCourseIdAndActiveTrueAndDeletedAtIsNull(
                        student.getId(),
                        courseId
                )
                .orElseThrow(
                        () -> new ForbiddenActionException(
                                "No tienes una matrícula activa en este curso"
                        )
                );
    }

    private void validatePublishedAndAvailable(
            Evaluation evaluation
    ) {
        if (
                evaluation.getStatus()
                        != EvaluationStatus.PUBLISHED
        ) {
            throw new ResourceNotFoundException(
                    "La evaluación no está publicada"
            );
        }

        if (
                evaluation.getAvailableFrom() != null
                        && evaluation
                        .getAvailableFrom()
                        .isAfter(LocalDateTime.now())
        ) {
            throw new ForbiddenActionException(
                    "La evaluación todavía no está disponible"
            );
        }
    }

    private String normalizeNullableText(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}