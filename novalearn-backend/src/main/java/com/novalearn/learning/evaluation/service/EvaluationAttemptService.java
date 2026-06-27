package com.novalearn.learning.evaluation.service;

import com.novalearn.common.exception.BadRequestException;
import com.novalearn.common.exception.ForbiddenActionException;
import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.learning.evaluation.dto.*;
import com.novalearn.learning.evaluation.entity.*;
import com.novalearn.learning.evaluation.enums.*;
import com.novalearn.learning.evaluation.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class EvaluationAttemptService {

    private final EvaluationRepository evaluationRepository;
    private final EvaluationQuestionRepository questionRepository;
    private final EvaluationOptionRepository optionRepository;
    private final EvaluationAttemptRepository attemptRepository;
    private final EvaluationAttemptAnswerRepository answerRepository;
    private final EnrollmentRepository enrollmentRepository;

    public EvaluationAttemptService(
            EvaluationRepository evaluationRepository,
            EvaluationQuestionRepository questionRepository,
            EvaluationOptionRepository optionRepository,
            EvaluationAttemptRepository attemptRepository,
            EvaluationAttemptAnswerRepository answerRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.evaluationRepository = evaluationRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional
    public EvaluationAttemptDetailResponse start(
            Long evaluationId,
            User student
    ) {
        Evaluation evaluation =
                findAvailableOnlineEvaluation(
                        evaluationId,
                        student,
                        true
                );

        Optional<EvaluationAttempt> activeAttempt =
                attemptRepository
                        .findFirstByEvaluationIdAndStudentIdAndStatusOrderByAttemptNumberDesc(
                                evaluationId,
                                student.getId(),
                                EvaluationAttemptStatus.IN_PROGRESS
                        );

        if (activeAttempt.isPresent()) {
            return buildDetail(activeAttempt.get());
        }

        long attemptCount =
                attemptRepository
                        .countByEvaluationIdAndStudentId(
                                evaluationId,
                                student.getId()
                        );

        if (attemptCount >= evaluation.getMaxAttempts()) {
            throw new BadRequestException(
                    "Ya alcanzaste el número máximo de intentos"
            );
        }

        List<EvaluationQuestion> questions =
                activeQuestions(evaluationId);

        if (questions.isEmpty()) {
            throw new BadRequestException(
                    "La evaluación todavía no tiene preguntas"
            );
        }

        EvaluationAttempt attempt =
                new EvaluationAttempt();
        attempt.setEvaluation(evaluation);
        attempt.setStudent(student);
        attempt.setAttemptNumber(
                Math.toIntExact(attemptCount + 1)
        );

        return buildDetail(
                attemptRepository.save(attempt)
        );
    }

    @Transactional
    public EvaluationAttemptDetailResponse findById(
            Long attemptId,
            User student
    ) {
        EvaluationAttempt attempt =
                findStudentAttempt(
                        attemptId,
                        student
                );

        validateEnrollment(
                attempt.getEvaluation(),
                student
        );

        return buildDetail(attempt);
    }

    @Transactional
    public EvaluationAttemptDetailResponse saveAnswers(
            Long attemptId,
            EvaluationAttemptSaveRequest request,
            User student
    ) {
        EvaluationAttempt attempt =
                findStudentAttempt(
                        attemptId,
                        student
                );

        ensureInProgress(attempt);
        ensureTimeAvailable(attempt);

        List<EvaluationAttemptAnswerRequest> requests =
                request != null
                        && request.getAnswers() != null
                        ? request.getAnswers()
                        : List.of();

        Map<Long, EvaluationQuestion> questions =
                activeQuestions(
                        attempt.getEvaluation().getId()
                )
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        EvaluationQuestion::getId,
                                        Function.identity()
                                )
                        );

        for (
                EvaluationAttemptAnswerRequest answerRequest
                : requests
        ) {
            saveAnswer(
                    attempt,
                    answerRequest,
                    questions
            );
        }

        return buildDetail(attempt);
    }

    @Transactional
    public EvaluationAttemptDetailResponse submit(
            Long attemptId,
            User student
    ) {
        EvaluationAttempt attempt =
                findStudentAttempt(
                        attemptId,
                        student
                );

        ensureInProgress(attempt);

        List<EvaluationQuestion> questions =
                activeQuestions(
                        attempt.getEvaluation().getId()
                );

        List<EvaluationAttemptAnswer> answers =
                answerRepository
                        .findByAttemptIdOrderByQuestionSortOrderAscQuestionIdAsc(
                                attemptId
                        );

        Map<Long, EvaluationAttemptAnswer> answerByQuestion =
                answers.stream()
                        .collect(
                                Collectors.toMap(
                                        answer ->
                                                answer.getQuestion().getId(),
                                        Function.identity()
                                )
                        );

        BigDecimal total =
                BigDecimal.ZERO;
        boolean manualReviewRequired = false;

        for (EvaluationQuestion question : questions) {
            EvaluationAttemptAnswer answer =
                    answerByQuestion.get(
                            question.getId()
                    );

            if (
                    question.getQuestionType()
                            == EvaluationQuestionType.SHORT_ANSWER
            ) {
                manualReviewRequired = true;

                if (answer != null) {
                    answer.setCorrect(null);
                    answer.setPointsEarned(null);
                    answerRepository.save(answer);
                }

                continue;
            }

            BigDecimal earned =
                    gradeObjectiveQuestion(
                            question,
                            answer
                    );

            total = total.add(earned);
        }

        BigDecimal cappedScore =
                total.min(
                        attempt.getEvaluation()
                                .getMaxScore()
                );

        if (manualReviewRequired) {
            attempt.submitForManualReview(
                    cappedScore
            );
        } else {
            BigDecimal passingScore =
                    attempt.getEvaluation()
                            .getPassingScore();

            Boolean passed =
                    passingScore == null
                            ? null
                            : cappedScore.compareTo(
                            passingScore
                    ) >= 0;

            attempt.grade(
                    cappedScore,
                    passed
            );
        }

        attemptRepository.save(attempt);

        return buildDetail(attempt);
    }

    @Transactional(readOnly = true)
    public List<EvaluationAttemptSummaryResponse> findHistory(
            Long evaluationId,
            User student
    ) {
        Evaluation evaluation =
                findAvailableOnlineEvaluation(
                        evaluationId,
                        student,
                        false
                );

        boolean revealResults =
                Boolean.TRUE.equals(
                        evaluation.getShowResults()
                );

        return attemptRepository
                .findByEvaluationIdAndStudentIdOrderByAttemptNumberDesc(
                        evaluationId,
                        student.getId()
                )
                .stream()
                .map(
                        attempt ->
                                new EvaluationAttemptSummaryResponse(
                                        attempt,
                                        revealResults
                                                && attempt.getStatus()
                                                != EvaluationAttemptStatus.IN_PROGRESS
                                )
                )
                .toList();
    }

    private void saveAnswer(
            EvaluationAttempt attempt,
            EvaluationAttemptAnswerRequest request,
            Map<Long, EvaluationQuestion> questions
    ) {
        if (
                request == null
                        || request.getQuestionId() == null
        ) {
            throw new BadRequestException(
                    "Cada respuesta debe indicar su pregunta"
            );
        }

        EvaluationQuestion question =
                questions.get(request.getQuestionId());

        if (question == null) {
            throw new BadRequestException(
                    "La pregunta no pertenece a esta evaluación"
            );
        }

        EvaluationAttemptAnswer answer =
                answerRepository
                        .findByAttemptIdAndQuestionId(
                                attempt.getId(),
                                question.getId()
                        )
                        .orElseGet(
                                () -> {
                                    EvaluationAttemptAnswer created =
                                            new EvaluationAttemptAnswer();
                                    created.setAttempt(attempt);
                                    created.setQuestion(question);
                                    return created;
                                }
                        );

        if (
                question.getQuestionType()
                        == EvaluationQuestionType.SHORT_ANSWER
        ) {
            answer.setTextAnswer(
                    normalizeText(
                            request.getTextAnswer()
                    )
            );
            answer.replaceSelectedOptions(
                    Set.of()
            );
        } else {
            List<Long> selectedIds =
                    request.getSelectedOptionIds()
                            != null
                            ? request.getSelectedOptionIds()
                            : List.of();

            Set<Long> uniqueIds =
                    new LinkedHashSet<>(selectedIds);

            List<EvaluationOption> availableOptions =
                    optionRepository
                            .findByQuestionIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(
                                    question.getId()
                            );

            Map<Long, EvaluationOption> optionById =
                    availableOptions.stream()
                            .collect(
                                    Collectors.toMap(
                                            EvaluationOption::getId,
                                            Function.identity()
                                    )
                            );

            if (
                    !optionById.keySet()
                            .containsAll(uniqueIds)
            ) {
                throw new BadRequestException(
                        "Una alternativa seleccionada no pertenece a la pregunta"
                );
            }

            Set<EvaluationOption> selectedOptions =
                    uniqueIds.stream()
                            .map(optionById::get)
                            .collect(
                                    Collectors.toCollection(
                                            LinkedHashSet::new
                                    )
                            );

            validateSelectionCount(
                    question,
                    selectedOptions.size()
            );

            answer.setTextAnswer(null);
            answer.replaceSelectedOptions(
                    selectedOptions
            );
        }

        answer.setCorrect(null);
        answer.setPointsEarned(null);
        answerRepository.save(answer);
    }

    private BigDecimal gradeObjectiveQuestion(
            EvaluationQuestion question,
            EvaluationAttemptAnswer answer
    ) {
        if (answer == null) {
            return BigDecimal.ZERO;
        }

        Set<Long> selected =
                answer.getSelectedOptions()
                        .stream()
                        .map(EvaluationOption::getId)
                        .collect(Collectors.toSet());

        Set<Long> correct =
                optionRepository
                        .findByQuestionIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(
                                question.getId()
                        )
                        .stream()
                        .filter(
                                option ->
                                        Boolean.TRUE.equals(
                                                option.getCorrect()
                                        )
                        )
                        .map(EvaluationOption::getId)
                        .collect(Collectors.toSet());

        boolean isCorrect =
                selected.equals(correct);

        BigDecimal points =
                isCorrect
                        ? question.getPoints()
                        : BigDecimal.ZERO;

        answer.setCorrect(isCorrect);
        answer.setPointsEarned(points);
        answerRepository.save(answer);

        return points;
    }

    private EvaluationAttemptDetailResponse buildDetail(
            EvaluationAttempt attempt
    ) {
        Evaluation evaluation =
                attempt.getEvaluation();

        List<EvaluationQuestion> questions =
                activeQuestions(
                        evaluation.getId()
                );

        if (
                Boolean.TRUE.equals(
                        evaluation.getShuffleQuestions()
                )
        ) {
            questions =
                    new ArrayList<>(questions);

            Collections.shuffle(
                    questions,
                    new Random(attempt.getId())
            );
        }

        Map<Long, EvaluationAttemptAnswer> answerByQuestion =
                answerRepository
                        .findByAttemptIdOrderByQuestionSortOrderAscQuestionIdAsc(
                                attempt.getId()
                        )
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        answer ->
                                                answer.getQuestion().getId(),
                                        Function.identity()
                                )
                        );

        boolean finished =
                attempt.getStatus()
                        != EvaluationAttemptStatus.IN_PROGRESS;

        boolean revealResults =
                finished
                        && Boolean.TRUE.equals(
                        evaluation.getShowResults()
                );

        boolean revealCorrectAnswers =
                revealResults
                        && Boolean.TRUE.equals(
                        evaluation.getShowCorrectAnswers()
                );

        List<EvaluationAttemptQuestionResponse> questionResponses =
                questions.stream()
                        .map(
                                question ->
                                        new EvaluationAttemptQuestionResponse(
                                                question,
                                                optionRepository
                                                        .findByQuestionIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(
                                                                question.getId()
                                                        ),
                                                answerByQuestion.get(
                                                        question.getId()
                                                ),
                                                revealResults,
                                                revealCorrectAnswers
                                        )
                        )
                        .toList();

        return new EvaluationAttemptDetailResponse(
                attempt,
                expiresAt(attempt),
                questionResponses,
                revealResults
        );
    }

    private Evaluation findAvailableOnlineEvaluation(
            Long evaluationId,
            User student,
            boolean requireOpenDeadline
    ) {
        validateStudent(student);

        Evaluation evaluation =
                evaluationRepository
                        .findByIdAndDeletedAtIsNull(
                                evaluationId
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Evaluación no encontrada"
                                        )
                        );

        validateEnrollment(
                evaluation,
                student
        );

        if (
                evaluation.getStatus()
                        != EvaluationStatus.PUBLISHED
        ) {
            throw new ResourceNotFoundException(
                    "La evaluación no está publicada"
            );
        }

        if (
                evaluation.getDeliveryMode()
                        != EvaluationDeliveryMode.ONLINE_QUIZ
        ) {
            throw new BadRequestException(
                    "Esta evaluación no utiliza cuestionario en línea"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        if (
                evaluation.getAvailableFrom() != null
                        && evaluation.getAvailableFrom()
                        .isAfter(now)
        ) {
            throw new ForbiddenActionException(
                    "La evaluación todavía no está disponible"
            );
        }

        if (
                requireOpenDeadline
                        && evaluation.getDueAt() != null
                        && now.isAfter(
                        evaluation.getDueAt()
                )
        ) {
            throw new ForbiddenActionException(
                    "La fecha límite de la evaluación ya terminó"
            );
        }

        return evaluation;
    }

    private EvaluationAttempt findStudentAttempt(
            Long attemptId,
            User student
    ) {
        validateStudent(student);

        return attemptRepository
                .findByIdAndStudentId(
                        attemptId,
                        student.getId()
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Intento no encontrado"
                                )
                );
    }

    private List<EvaluationQuestion> activeQuestions(
            Long evaluationId
    ) {
        return questionRepository
                .findByEvaluationIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(
                        evaluationId
                );
    }

    private void validateEnrollment(
            Evaluation evaluation,
            User student
    ) {
        enrollmentRepository
                .findByStudentIdAndCourseIdAndActiveTrueAndDeletedAtIsNull(
                        student.getId(),
                        evaluation.getModule()
                                .getCourse()
                                .getId()
                )
                .orElseThrow(
                        () ->
                                new ForbiddenActionException(
                                        "No tienes una matrícula activa en este curso"
                                )
                );
    }

    private void validateStudent(User student) {
        if (
                student == null
                        || student.getRole()
                        != UserRole.STUDENT
        ) {
            throw new ForbiddenActionException(
                    "Solo los estudiantes pueden realizar evaluaciones"
            );
        }
    }

    private void ensureInProgress(
            EvaluationAttempt attempt
    ) {
        if (
                attempt.getStatus()
                        != EvaluationAttemptStatus.IN_PROGRESS
        ) {
            throw new BadRequestException(
                    "Este intento ya fue enviado"
            );
        }
    }

    private void ensureTimeAvailable(
            EvaluationAttempt attempt
    ) {
        LocalDateTime expiresAt =
                expiresAt(attempt);

        if (
                expiresAt != null
                        && LocalDateTime.now()
                        .isAfter(expiresAt)
        ) {
            throw new BadRequestException(
                    "El tiempo del intento terminó. Envía el cuestionario para finalizarlo"
            );
        }
    }

    private LocalDateTime expiresAt(
            EvaluationAttempt attempt
    ) {
        Integer limit =
                attempt.getEvaluation()
                        .getTimeLimitMinutes();

        return limit == null
                ? null
                : attempt.getStartedAt()
                .plusMinutes(limit);
    }

    private void validateSelectionCount(
            EvaluationQuestion question,
            int selectedCount
    ) {
        switch (question.getQuestionType()) {
            case SINGLE_CHOICE, TRUE_FALSE -> {
                if (selectedCount > 1) {
                    throw new BadRequestException(
                            "Esta pregunta permite seleccionar una sola alternativa"
                    );
                }
            }
            case MULTIPLE_CHOICE -> {
                // Puede guardarse sin selección o con varias.
            }
            case SHORT_ANSWER -> throw new BadRequestException(
                    "La respuesta corta no utiliza alternativas"
            );
        }
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}