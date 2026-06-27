package com.novalearn.learning.quiz.service;

import com.novalearn.common.exception.BadRequestException;
import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.core.user.entity.User;
import com.novalearn.instructor.security.service.InstructorContentAccessService;
import com.novalearn.learning.lesson.entity.Lesson;
import com.novalearn.learning.lesson.enums.LessonType;
import com.novalearn.learning.quiz.dto.QuizDetailResponse;
import com.novalearn.learning.quiz.dto.QuizOptionRequest;
import com.novalearn.learning.quiz.dto.QuizQuestionRequest;
import com.novalearn.learning.quiz.dto.QuizQuestionResponse;
import com.novalearn.learning.quiz.dto.QuizSettingRequest;
import com.novalearn.learning.quiz.dto.QuizSettingResponse;
import com.novalearn.learning.quiz.entity.QuizOption;
import com.novalearn.learning.quiz.entity.QuizQuestion;
import com.novalearn.learning.quiz.entity.QuizSetting;
import com.novalearn.learning.quiz.repository.QuizOptionRepository;
import com.novalearn.learning.quiz.repository.QuizQuestionRepository;
import com.novalearn.learning.quiz.repository.QuizSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class QuizManagementService {

    private final InstructorContentAccessService accessService;
    private final QuizSettingRepository settingRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizOptionRepository optionRepository;

    public QuizManagementService(
            InstructorContentAccessService accessService,
            QuizSettingRepository settingRepository,
            QuizQuestionRepository questionRepository,
            QuizOptionRepository optionRepository
    ) {
        this.accessService = accessService;
        this.settingRepository = settingRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
    }

    @Transactional(readOnly = true)
    public QuizDetailResponse findByLessonId(
            Long lessonId,
            User authenticatedUser
    ) {
        Lesson lesson =
                findAccessibleQuizLesson(
                        lessonId,
                        authenticatedUser
                );

        QuizSetting setting =
                settingRepository
                        .findByLessonId(lessonId)
                        .orElse(null);

        List<QuizQuestionResponse> questions =
                questionRepository
                        .findAllByLessonIdAndDeletedAtIsNullOrderBySortOrderAsc(
                                lessonId
                        )
                        .stream()
                        .map(this::mapQuestionResponse)
                        .toList();

        return new QuizDetailResponse(
                lesson.getId(),
                lesson.getTitle(),
                setting != null
                        ? new QuizSettingResponse(setting)
                        : null,
                questions
        );
    }

    @Transactional
    public QuizSettingResponse saveSettings(
            Long lessonId,
            QuizSettingRequest request,
            User authenticatedUser
    ) {
        Lesson lesson =
                findAccessibleQuizLesson(
                        lessonId,
                        authenticatedUser
                );

        validateSettings(request);

        QuizSetting setting =
                settingRepository
                        .findByLessonId(lessonId)
                        .orElseGet(QuizSetting::new);

        setting.setLesson(lesson);
        setting.setPassingScore(
                request.getPassingScore()
        );
        setting.setMaxAttempts(
                request.getMaxAttempts()
        );
        setting.setShuffleQuestions(
                request.getShuffleQuestions()
        );
        setting.setShuffleOptions(
                request.getShuffleOptions()
        );
        setting.setShowResult(
                request.getShowResult()
        );
        setting.setShowCorrectAnswers(
                request.getShowCorrectAnswers()
        );

        QuizSetting savedSetting =
                settingRepository.save(setting);

        return new QuizSettingResponse(
                savedSetting
        );
    }

    @Transactional
    public QuizQuestionResponse createQuestion(
            Long lessonId,
            QuizQuestionRequest request,
            User authenticatedUser
    ) {
        Lesson lesson =
                findAccessibleQuizLesson(
                        lessonId,
                        authenticatedUser
                );

        validateQuestionRequest(request);
        validateUniqueQuestionOrder(
                lessonId,
                null,
                request.getSortOrder()
        );

        QuizQuestion question =
                new QuizQuestion();

        applyQuestionData(
                question,
                lesson,
                request
        );

        QuizQuestion savedQuestion =
                questionRepository.save(question);

        List<QuizOption> savedOptions =
                createOptions(
                        savedQuestion,
                        request.getOptions()
                );

        return new QuizQuestionResponse(
                savedQuestion,
                savedOptions
        );
    }

    @Transactional
    public QuizQuestionResponse updateQuestion(
            Long lessonId,
            Long questionId,
            QuizQuestionRequest request,
            User authenticatedUser
    ) {
        Lesson lesson =
                findAccessibleQuizLesson(
                        lessonId,
                        authenticatedUser
                );

        validateQuestionRequest(request);
        validateUniqueQuestionOrder(
                lessonId,
                questionId,
                request.getSortOrder()
        );

        QuizQuestion question =
                questionRepository
                        .findByIdAndLessonIdAndDeletedAtIsNull(
                                questionId,
                                lessonId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pregunta no encontrada"
                                )
                        );

        applyQuestionData(
                question,
                lesson,
                request
        );

        QuizQuestion savedQuestion =
                questionRepository.save(question);

        replaceOptions(
                savedQuestion,
                request.getOptions()
        );

        List<QuizOption> savedOptions =
                optionRepository
                        .findAllByQuestionIdAndDeletedAtIsNullOrderBySortOrderAsc(
                                savedQuestion.getId()
                        );

        return new QuizQuestionResponse(
                savedQuestion,
                savedOptions
        );
    }

    @Transactional
    public void deleteQuestion(
            Long lessonId,
            Long questionId,
            User authenticatedUser
    ) {
        findAccessibleQuizLesson(
                lessonId,
                authenticatedUser
        );

        QuizQuestion question =
                questionRepository
                        .findByIdAndLessonIdAndDeletedAtIsNull(
                                questionId,
                                lessonId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pregunta no encontrada"
                                )
                        );

        List<QuizOption> options =
                optionRepository
                        .findAllByQuestionIdAndDeletedAtIsNullOrderBySortOrderAsc(
                                questionId
                        );

        options.forEach(
                QuizOption::softDelete
        );

        optionRepository.saveAll(options);

        question.softDelete();

        questionRepository.save(question);
    }

    private Lesson findAccessibleQuizLesson(
            Long lessonId,
            User authenticatedUser
    ) {
        Lesson lesson =
                accessService.getAccessibleLesson(
                        lessonId,
                        authenticatedUser
                );

        if (
                lesson.getLessonType()
                        != LessonType.QUIZ
        ) {
            throw new BadRequestException(
                    "La leccion seleccionada no es de tipo QUIZ"
            );
        }

        return lesson;
    }

    private QuizQuestionResponse mapQuestionResponse(
            QuizQuestion question
    ) {
        List<QuizOption> options =
                optionRepository
                        .findAllByQuestionIdAndDeletedAtIsNullOrderBySortOrderAsc(
                                question.getId()
                        );

        return new QuizQuestionResponse(
                question,
                options
        );
    }

    private void applyQuestionData(
            QuizQuestion question,
            Lesson lesson,
            QuizQuestionRequest request
    ) {
        question.setLesson(lesson);

        question.setQuestionText(
                request.getQuestionText().trim()
        );

        question.setPoints(
                request.getPoints()
        );

        question.setExplanation(
                normalizeOptionalText(
                        request.getExplanation()
                )
        );

        question.setSortOrder(
                request.getSortOrder()
        );

        question.setActive(
                request.getActive()
        );
    }

    private List<QuizOption> createOptions(
            QuizQuestion question,
            List<QuizOptionRequest> requests
    ) {
        List<QuizOption> options =
                requests.stream()
                        .map(request ->
                                createOption(
                                        question,
                                        request
                                )
                        )
                        .toList();

        return optionRepository.saveAll(
                options
        );
    }

    private QuizOption createOption(
            QuizQuestion question,
            QuizOptionRequest request
    ) {
        QuizOption option =
                new QuizOption();

        option.setQuestion(question);

        option.setOptionText(
                request.getOptionText().trim()
        );

        option.setCorrect(
                request.getCorrect()
        );

        option.setSortOrder(
                request.getSortOrder()
        );

        return option;
    }

    private void replaceOptions(
            QuizQuestion question,
            List<QuizOptionRequest> requests
    ) {
        List<QuizOption> currentOptions =
                optionRepository
                        .findAllByQuestionIdAndDeletedAtIsNullOrderBySortOrderAsc(
                                question.getId()
                        );

        currentOptions.forEach(
                QuizOption::softDelete
        );

        optionRepository.saveAll(
                currentOptions
        );

        optionRepository.flush();

        createOptions(
                question,
                requests
        );
    }

    private void validateSettings(
            QuizSettingRequest request
    ) {
        if (request == null) {
            throw new BadRequestException(
                    "La configuracion del cuestionario es obligatoria"
            );
        }

        if (
                Boolean.TRUE.equals(
                        request.getShowCorrectAnswers()
                )
                        && !Boolean.TRUE.equals(
                        request.getShowResult()
                )
        ) {
            throw new BadRequestException(
                    "No se pueden mostrar las respuestas correctas si el resultado esta oculto"
            );
        }
    }

    private void validateQuestionRequest(
            QuizQuestionRequest request
    ) {
        if (request == null) {
            throw new BadRequestException(
                    "Los datos de la pregunta son obligatorios"
            );
        }

        List<QuizOptionRequest> options =
                request.getOptions();

        if (
                options == null
                        || options.size() < 2
        ) {
            throw new BadRequestException(
                    "La pregunta debe tener al menos dos opciones"
            );
        }

        long correctOptions =
                options.stream()
                        .filter(option ->
                                Boolean.TRUE.equals(
                                        option.getCorrect()
                                )
                        )
                        .count();

        if (correctOptions != 1) {
            throw new BadRequestException(
                    "La pregunta debe tener exactamente una opcion correcta"
            );
        }

        validateUniqueOptionOrders(options);
        validateUniqueOptionTexts(options);
    }

    private void validateUniqueQuestionOrder(
            Long lessonId,
            Long currentQuestionId,
            Integer requestedOrder
    ) {
        List<QuizQuestion> questions =
                questionRepository
                        .findAllByLessonIdAndDeletedAtIsNullOrderBySortOrderAsc(
                                lessonId
                        );

        boolean duplicatedOrder =
                questions.stream()
                        .filter(question ->
                                currentQuestionId == null
                                        || !question.getId()
                                        .equals(currentQuestionId)
                        )
                        .anyMatch(question ->
                                question.getSortOrder()
                                        .equals(requestedOrder)
                        );

        if (duplicatedOrder) {
            throw new BadRequestException(
                    "No puede haber dos preguntas con el mismo orden"
            );
        }
    }

    private void validateUniqueOptionOrders(
            List<QuizOptionRequest> options
    ) {
        Set<Integer> orders =
                new HashSet<>();

        for (QuizOptionRequest option : options) {
            if (
                    !orders.add(
                            option.getSortOrder()
                    )
            ) {
                throw new BadRequestException(
                        "Las opciones no pueden tener el mismo orden"
                );
            }
        }
    }

    private void validateUniqueOptionTexts(
            List<QuizOptionRequest> options
    ) {
        Set<String> texts =
                new HashSet<>();

        for (QuizOptionRequest option : options) {
            String normalizedText =
                    option.getOptionText()
                            .trim()
                            .toLowerCase(
                                    Locale.ROOT
                            );

            if (!texts.add(normalizedText)) {
                throw new BadRequestException(
                        "Las opciones no pueden tener textos repetidos"
                );
            }
        }
    }

    private String normalizeOptionalText(
            String value
    ) {
        if (
                value == null
                        || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }
}