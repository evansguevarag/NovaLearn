package com.novalearn.learning.evaluation.service;

import com.novalearn.common.exception.BadRequestException;
import com.novalearn.common.exception.ForbiddenActionException;
import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.instructor.security.service.InstructorContentAccessService;
import com.novalearn.learning.evaluation.dto.EvaluationOptionRequest;
import com.novalearn.learning.evaluation.dto.EvaluationQuestionRequest;
import com.novalearn.learning.evaluation.dto.EvaluationQuestionResponse;
import com.novalearn.learning.evaluation.entity.Evaluation;
import com.novalearn.learning.evaluation.entity.EvaluationOption;
import com.novalearn.learning.evaluation.entity.EvaluationQuestion;
import com.novalearn.learning.evaluation.enums.EvaluationDeliveryMode;
import com.novalearn.learning.evaluation.enums.EvaluationQuestionType;
import com.novalearn.learning.evaluation.repository.EvaluationOptionRepository;
import com.novalearn.learning.evaluation.repository.EvaluationQuestionRepository;
import com.novalearn.learning.evaluation.repository.EvaluationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class EvaluationQuestionService {

    private final EvaluationRepository evaluationRepository;
    private final EvaluationQuestionRepository questionRepository;
    private final EvaluationOptionRepository optionRepository;
    private final InstructorContentAccessService accessService;

    public EvaluationQuestionService(
            EvaluationRepository evaluationRepository,
            EvaluationQuestionRepository questionRepository,
            EvaluationOptionRepository optionRepository,
            InstructorContentAccessService accessService
    ) {
        this.evaluationRepository = evaluationRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.accessService = accessService;
    }

    @Transactional(readOnly = true)
    public List<EvaluationQuestionResponse> findAll(
            Long evaluationId,
            User user
    ) {
        Evaluation evaluation =
                getManagedOnlineEvaluation(
                        evaluationId,
                        user
                );

        return questionRepository
                .findByEvaluationIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(
                        evaluation.getId()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public EvaluationQuestionResponse create(
            Long evaluationId,
            EvaluationQuestionRequest request,
            User user
    ) {
        Evaluation evaluation =
                getManagedOnlineEvaluation(
                        evaluationId,
                        user
                );

        validateRequest(
                evaluation,
                null,
                request
        );

        EvaluationQuestion question =
                new EvaluationQuestion();

        question.setEvaluation(evaluation);
        applyQuestion(question, request);

        EvaluationQuestion savedQuestion =
                questionRepository.save(question);

        List<EvaluationOption> options =
                replaceOptions(
                        savedQuestion,
                        request
                );

        return new EvaluationQuestionResponse(
                savedQuestion,
                options
        );
    }

    @Transactional
    public EvaluationQuestionResponse update(
            Long evaluationId,
            Long questionId,
            EvaluationQuestionRequest request,
            User user
    ) {
        Evaluation evaluation =
                getManagedOnlineEvaluation(
                        evaluationId,
                        user
                );

        EvaluationQuestion question =
                getQuestion(
                        evaluationId,
                        questionId
                );

        validateRequest(
                evaluation,
                questionId,
                request
        );

        applyQuestion(question, request);

        EvaluationQuestion savedQuestion =
                questionRepository.save(question);

        List<EvaluationOption> options =
                replaceOptions(
                        savedQuestion,
                        request
                );

        return new EvaluationQuestionResponse(
                savedQuestion,
                options
        );
    }

    @Transactional
    public void delete(
            Long evaluationId,
            Long questionId,
            User user
    ) {
        getManagedOnlineEvaluation(
                evaluationId,
                user
        );

        EvaluationQuestion question =
                getQuestion(
                        evaluationId,
                        questionId
                );

        List<EvaluationOption> options =
                optionRepository
                        .findByQuestionIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(
                                questionId
                        );

        options.forEach(
                EvaluationOption::softDelete
        );

        optionRepository.saveAll(options);

        question.softDelete();
        questionRepository.save(question);
    }

    private EvaluationQuestionResponse toResponse(
            EvaluationQuestion question
    ) {
        List<EvaluationOption> options =
                optionRepository
                        .findByQuestionIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(
                                question.getId()
                        );

        return new EvaluationQuestionResponse(
                question,
                options
        );
    }

    private Evaluation getManagedOnlineEvaluation(
            Long evaluationId,
            User user
    ) {
        validateManager(user);

        Evaluation evaluation =
                evaluationRepository
                        .findByIdAndDeletedAtIsNull(
                                evaluationId
                        )
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "Evaluación no encontrada"
                                )
                        );

        accessService.getAccessibleCourse(
                evaluation.getModule()
                        .getCourse()
                        .getId(),
                user
        );

        if (
                evaluation.getDeliveryMode()
                        != EvaluationDeliveryMode.ONLINE_QUIZ
        ) {
            throw new BadRequestException(
                    "Solo las evaluaciones con modalidad de cuestionario en línea admiten preguntas"
            );
        }

        return evaluation;
    }

    private EvaluationQuestion getQuestion(
            Long evaluationId,
            Long questionId
    ) {
        return questionRepository
                .findByIdAndEvaluationIdAndDeletedAtIsNull(
                        questionId,
                        evaluationId
                )
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Pregunta no encontrada"
                        )
                );
    }

    private void applyQuestion(
            EvaluationQuestion question,
            EvaluationQuestionRequest request
    ) {
        question.setQuestionType(
                request.getQuestionType()
        );

        question.setPrompt(
                request.getPrompt().trim()
        );

        question.setExplanation(
                normalizeNullableText(
                        request.getExplanation()
                )
        );

        question.setPoints(
                request.getPoints() != null
                        ? request.getPoints()
                        : BigDecimal.ONE
        );

        question.setSortOrder(
                request.getSortOrder() != null
                        ? request.getSortOrder()
                        : 1
        );

        question.setRequired(
                request.getRequired() == null
                        || request.getRequired()
        );
    }

    private List<EvaluationOption> replaceOptions(
            EvaluationQuestion question,
            EvaluationQuestionRequest request
    ) {
        List<EvaluationOption> currentOptions =
                optionRepository
                        .findByQuestionIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(
                                question.getId()
                        );

        currentOptions.forEach(
                EvaluationOption::softDelete
        );

        optionRepository.saveAll(currentOptions);
        optionRepository.flush();

        if (
                request.getQuestionType()
                        == EvaluationQuestionType.SHORT_ANSWER
        ) {
            return List.of();
        }

        List<EvaluationOption> newOptions =
                new ArrayList<>();

        for (
                EvaluationOptionRequest optionRequest :
                request.getOptions()
        ) {
            EvaluationOption option =
                    new EvaluationOption();

            option.setQuestion(question);
            option.setOptionText(
                    optionRequest
                            .getOptionText()
                            .trim()
            );
            option.setCorrect(
                    Boolean.TRUE.equals(
                            optionRequest.getCorrect()
                    )
            );
            option.setSortOrder(
                    optionRequest.getSortOrder()
            );

            newOptions.add(option);
        }

        return optionRepository.saveAll(
                newOptions
        );
    }

    private void validateRequest(
            Evaluation evaluation,
            Long currentQuestionId,
            EvaluationQuestionRequest request
    ) {
        Integer sortOrder =
                request.getSortOrder() != null
                        ? request.getSortOrder()
                        : 1;

        boolean duplicatedSortOrder =
                currentQuestionId == null
                        ? questionRepository
                        .existsByEvaluationIdAndSortOrderAndDeletedAtIsNull(
                                evaluation.getId(),
                                sortOrder
                        )
                        : questionRepository
                        .existsByEvaluationIdAndSortOrderAndIdNotAndDeletedAtIsNull(
                                evaluation.getId(),
                                sortOrder,
                                currentQuestionId
                        );

        if (duplicatedSortOrder) {
            throw new BadRequestException(
                    "Ya existe otra pregunta con el mismo orden"
            );
        }

        List<EvaluationOptionRequest> options =
                request.getOptions() == null
                        ? List.of()
                        : request.getOptions();

        if (
                request.getQuestionType()
                        == EvaluationQuestionType.SHORT_ANSWER
        ) {
            if (!options.isEmpty()) {
                throw new BadRequestException(
                        "Las preguntas de respuesta corta no deben tener alternativas"
                );
            }

            return;
        }

        if (options.size() < 2) {
            throw new BadRequestException(
                    "La pregunta debe tener al menos dos alternativas"
            );
        }

        Set<Integer> sortOrders =
                new HashSet<>();

        long correctCount = 0;

        for (
                EvaluationOptionRequest option :
                options
        ) {
            if (
                    option.getSortOrder() == null
                            || option.getSortOrder() < 1
            ) {
                throw new BadRequestException(
                        "Cada alternativa debe tener un orden válido"
                );
            }

            if (
                    !sortOrders.add(
                            option.getSortOrder()
                    )
            ) {
                throw new BadRequestException(
                        "No puede repetirse el orden de las alternativas"
                );
            }

            if (
                    Boolean.TRUE.equals(
                            option.getCorrect()
                    )
            ) {
                correctCount++;
            }
        }

        if (
                request.getQuestionType()
                        == EvaluationQuestionType.SINGLE_CHOICE
                        && correctCount != 1
        ) {
            throw new BadRequestException(
                    "Una pregunta de opción única debe tener exactamente una respuesta correcta"
            );
        }

        if (
                request.getQuestionType()
                        == EvaluationQuestionType.MULTIPLE_CHOICE
                        && correctCount < 1
        ) {
            throw new BadRequestException(
                    "Una pregunta de opción múltiple debe tener al menos una respuesta correcta"
            );
        }

        if (
                request.getQuestionType()
                        == EvaluationQuestionType.TRUE_FALSE
        ) {
            if (options.size() != 2) {
                throw new BadRequestException(
                        "Una pregunta de verdadero o falso debe tener exactamente dos alternativas"
                );
            }

            if (correctCount != 1) {
                throw new BadRequestException(
                        "Una pregunta de verdadero o falso debe tener exactamente una respuesta correcta"
                );
            }
        }
    }

    private void validateManager(
            User user
    ) {
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
                    "No tienes permiso para administrar preguntas"
            );
        }
    }

    private String normalizeNullableText(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String normalized =
                value.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}