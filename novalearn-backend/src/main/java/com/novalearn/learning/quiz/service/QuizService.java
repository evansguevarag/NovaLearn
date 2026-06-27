package com.novalearn.learning.quiz.service;

import com.novalearn.common.exception.BadRequestException;
import com.novalearn.common.exception.ResourceNotFoundException;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.learning.lesson.entity.Lesson;
import com.novalearn.learning.lesson.enums.LessonType;
import com.novalearn.learning.lesson.repository.LessonRepository;
import com.novalearn.learning.quiz.dto.QuizAnswerRequest;
import com.novalearn.learning.quiz.dto.QuizAttemptResponse;
import com.novalearn.learning.quiz.dto.QuizResultAnswerResponse;
import com.novalearn.learning.quiz.dto.QuizResultResponse;
import com.novalearn.learning.quiz.dto.QuizSubmissionRequest;
import com.novalearn.learning.quiz.dto.StudentQuizQuestionResponse;
import com.novalearn.learning.quiz.dto.StudentQuizResponse;
import com.novalearn.learning.quiz.entity.QuizAttempt;
import com.novalearn.learning.quiz.entity.QuizAttemptAnswer;
import com.novalearn.learning.quiz.entity.QuizOption;
import com.novalearn.learning.quiz.entity.QuizQuestion;
import com.novalearn.learning.quiz.entity.QuizSetting;
import com.novalearn.learning.quiz.repository.QuizAttemptAnswerRepository;
import com.novalearn.learning.quiz.repository.QuizAttemptRepository;
import com.novalearn.learning.quiz.repository.QuizOptionRepository;
import com.novalearn.learning.quiz.repository.QuizQuestionRepository;
import com.novalearn.learning.quiz.repository.QuizSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class QuizService {

    private static final int SCORE_SCALE = 2;

    private final LessonRepository lessonRepository;
    private final QuizSettingRepository settingRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizOptionRepository optionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizAttemptAnswerRepository answerRepository;

    public QuizService(
            LessonRepository lessonRepository,
            QuizSettingRepository settingRepository,
            QuizQuestionRepository questionRepository,
            QuizOptionRepository optionRepository,
            QuizAttemptRepository attemptRepository,
            QuizAttemptAnswerRepository answerRepository
    ) {
        this.lessonRepository = lessonRepository;
        this.settingRepository = settingRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
    }

    @Transactional
    public StudentQuizResponse startAttempt(
            User student,
            Long lessonId
    ) {
        validateStudent(student);

        Lesson lesson =
                findAvailableQuizLesson(lessonId);

        QuizSetting setting =
                findQuizSetting(lessonId);

        List<QuizQuestion> questions =
                findValidActiveQuestions(lessonId);

        QuizAttempt attempt =
                findOrCreateAttempt(
                        student,
                        lesson,
                        setting
                );

        List<StudentQuizQuestionResponse> questionResponses =
                mapStudentQuestions(
                        questions,
                        setting
                );

        int remainingAttempts =
                calculateRemainingAttempts(
                        student.getId(),
                        lessonId,
                        setting.getMaxAttempts()
                );

        return new StudentQuizResponse(
                lesson.getId(),
                lesson.getTitle(),
                attempt.getId(),
                attempt.getAttemptNumber(),
                setting.getPassingScore(),
                setting.getMaxAttempts(),
                remainingAttempts,
                setting.getShuffleQuestions(),
                setting.getShuffleOptions(),
                questionResponses
        );
    }

    @Transactional
    public QuizResultResponse submitAttempt(
            User student,
            Long lessonId,
            QuizSubmissionRequest request
    ) {
        validateStudent(student);

        if (request == null) {
            throw new BadRequestException(
                    "Las respuestas del cuestionario son obligatorias"
            );
        }

        findAvailableQuizLesson(lessonId);

        QuizSetting setting =
                findQuizSetting(lessonId);

        QuizAttempt attempt =
                attemptRepository
                        .findByIdAndStudentId(
                                request.getAttemptId(),
                                student.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Intento de cuestionario no encontrado"
                                )
                        );

        validateAttempt(
                attempt,
                lessonId
        );

        List<QuizQuestion> questions =
                findValidActiveQuestions(lessonId);

        validateSubmittedAnswers(
                questions,
                request.getAnswers()
        );

        Map<Long, QuizAnswerRequest> submittedAnswers =
                request.getAnswers()
                        .stream()
                        .collect(
                                HashMap::new,
                                (
                                        answersByQuestion,
                                        answer
                                ) -> answersByQuestion.put(
                                        answer.getQuestionId(),
                                        answer
                                ),
                                HashMap::putAll
                        );

        List<QuizAttemptAnswer> attemptAnswers =
                new ArrayList<>();

        BigDecimal totalPoints =
                BigDecimal.ZERO;

        BigDecimal earnedPoints =
                BigDecimal.ZERO;

        int correctAnswers = 0;

        for (QuizQuestion question : questions) {
            QuizAnswerRequest submittedAnswer =
                    submittedAnswers.get(
                            question.getId()
                    );

            QuizOption selectedOption =
                    optionRepository
                            .findByIdAndQuestionIdAndDeletedAtIsNull(
                                    submittedAnswer.getSelectedOptionId(),
                                    question.getId()
                            )
                            .orElseThrow(() ->
                                    new BadRequestException(
                                            "La opcion seleccionada no pertenece a la pregunta"
                                    )
                            );

            QuizAttemptAnswer attemptAnswer =
                    new QuizAttemptAnswer();

            attemptAnswer.setAttempt(attempt);
            attemptAnswer.setQuestion(question);
            attemptAnswer.evaluate(
                    selectedOption
            );

            attemptAnswers.add(
                    attemptAnswer
            );

            totalPoints =
                    totalPoints.add(
                            question.getPoints()
                    );

            earnedPoints =
                    earnedPoints.add(
                            attemptAnswer.getPointsEarned()
                    );

            if (
                    Boolean.TRUE.equals(
                            attemptAnswer.getCorrect()
                    )
            ) {
                correctAnswers++;
            }
        }

        BigDecimal score =
                calculateScore(
                        earnedPoints,
                        totalPoints
                );

        boolean passed =
                score.compareTo(
                        setting.getPassingScore()
                ) >= 0;

        answerRepository.saveAll(
                attemptAnswers
        );

        attempt.complete(
                score,
                questions.size(),
                correctAnswers,
                passed
        );

        QuizAttempt savedAttempt =
                attemptRepository.save(
                        attempt
                );

        return buildResultResponse(
                savedAttempt,
                setting,
                attemptAnswers
        );
    }

    @Transactional(readOnly = true)
    public QuizResultResponse findAttemptResult(
            User student,
            Long attemptId
    ) {
        validateStudent(student);

        QuizAttempt attempt =
                attemptRepository
                        .findByIdAndStudentId(
                                attemptId,
                                student.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Intento de cuestionario no encontrado"
                                )
                        );

        if (!attempt.isCompleted()) {
            throw new BadRequestException(
                    "El intento todavia no ha sido finalizado"
            );
        }

        Long lessonId =
                attempt.getLesson().getId();

        QuizSetting setting =
                findQuizSetting(lessonId);

        List<QuizAttemptAnswer> answers =
                answerRepository
                        .findAllByAttemptIdOrderByQuestionSortOrderAsc(
                                attemptId
                        );

        return buildResultResponse(
                attempt,
                setting,
                answers
        );
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> findAttempts(
            User student,
            Long lessonId
    ) {
        validateStudent(student);

        findAvailableQuizLesson(lessonId);

        return attemptRepository
                .findAllByStudentIdAndLessonIdOrderByAttemptNumberDesc(
                        student.getId(),
                        lessonId
                )
                .stream()
                .map(attempt -> {
                    List<QuizAttemptAnswer> answers =
                            answerRepository
                                    .findAllByAttemptIdOrderByQuestionSortOrderAsc(
                                            attempt.getId()
                                    );

                    return new QuizAttemptResponse(
                            attempt,
                            answers
                    );
                })
                .toList();
    }

    private QuizAttempt findOrCreateAttempt(
            User student,
            Lesson lesson,
            QuizSetting setting
    ) {
        QuizAttempt latestAttempt =
                attemptRepository
                        .findFirstByStudentIdAndLessonIdOrderByAttemptNumberDesc(
                                student.getId(),
                                lesson.getId()
                        )
                        .orElse(null);

        if (
                latestAttempt != null
                        && !latestAttempt.isCompleted()
        ) {
            return latestAttempt;
        }

        long usedAttempts =
                attemptRepository
                        .countByStudentIdAndLessonId(
                                student.getId(),
                                lesson.getId()
                        );

        if (
                usedAttempts
                        >= setting.getMaxAttempts()
        ) {
            throw new BadRequestException(
                    "Ya alcanzaste la cantidad maxima de intentos permitidos"
            );
        }

        QuizAttempt attempt =
                new QuizAttempt();

        attempt.setStudent(student);
        attempt.setLesson(lesson);
        attempt.setAttemptNumber(
                Math.toIntExact(
                        usedAttempts + 1
                )
        );

        return attemptRepository.save(
                attempt
        );
    }

    private List<StudentQuizQuestionResponse> mapStudentQuestions(
            List<QuizQuestion> questions,
            QuizSetting setting
    ) {
        List<StudentQuizQuestionResponse> responses =
                questions.stream()
                        .map(question -> {
                            List<QuizOption> options =
                                    new ArrayList<>(
                                            optionRepository
                                                    .findAllByQuestionIdAndDeletedAtIsNullOrderBySortOrderAsc(
                                                            question.getId()
                                                    )
                                    );

                            if (
                                    Boolean.TRUE.equals(
                                            setting.getShuffleOptions()
                                    )
                            ) {
                                Collections.shuffle(
                                        options
                                );
                            }


                            return new StudentQuizQuestionResponse(
                                    question,
                                    options
                            );
                        })
                        .collect(
                                ArrayList::new,
                                ArrayList::add,
                                ArrayList::addAll
                        );

        if (
                Boolean.TRUE.equals(
                        setting.getShuffleQuestions()
                )
        ) {
            Collections.shuffle(
                    responses
            );
        }

        return responses;
    }

    private List<QuizQuestion> findValidActiveQuestions(
            Long lessonId
    ) {
        List<QuizQuestion> questions =
                questionRepository
                        .findAllByLessonIdAndActiveTrueAndDeletedAtIsNullOrderBySortOrderAsc(
                                lessonId
                        );

        if (questions.isEmpty()) {
            throw new BadRequestException(
                    "El cuestionario no tiene preguntas activas"
            );
        }

        for (QuizQuestion question : questions) {
            List<QuizOption> options =
                    optionRepository
                            .findAllByQuestionIdAndDeletedAtIsNullOrderBySortOrderAsc(
                                    question.getId()
                            );

            if (options.size() < 2) {
                throw new BadRequestException(
                        "Todas las preguntas deben tener al menos dos opciones"
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
                        "Todas las preguntas deben tener exactamente una opcion correcta"
                );
            }
        }

        return questions;
    }

    private void validateSubmittedAnswers(
            List<QuizQuestion> questions,
            List<QuizAnswerRequest> answers
    ) {
        if (answers == null) {
            throw new BadRequestException(
                    "Las respuestas son obligatorias"
            );
        }

        if (
                answers.size()
                        != questions.size()
        ) {
            throw new BadRequestException(
                    "Debes responder todas las preguntas del cuestionario"
            );
        }

        Set<Long> validQuestionIds =
                questions.stream()
                        .map(QuizQuestion::getId)
                        .collect(
                                HashSet::new,
                                HashSet::add,
                                HashSet::addAll
                        );

        Set<Long> submittedQuestionIds =
                new HashSet<>();

        for (QuizAnswerRequest answer : answers) {
            if (
                    answer == null
                            || answer.getQuestionId() == null
                            || answer.getSelectedOptionId() == null
            ) {
                throw new BadRequestException(
                        "Todas las respuestas deben incluir pregunta y opcion"
                );
            }

            if (
                    !validQuestionIds.contains(
                            answer.getQuestionId()
                    )
            ) {
                throw new BadRequestException(
                        "Se envio una pregunta que no pertenece al cuestionario"
                );
            }

            if (
                    !submittedQuestionIds.add(
                            answer.getQuestionId()
                    )
            ) {
                throw new BadRequestException(
                        "No se puede responder una pregunta mas de una vez"
                );
            }
        }
    }

    private QuizResultResponse buildResultResponse(
            QuizAttempt attempt,
            QuizSetting setting,
            List<QuizAttemptAnswer> answers
    ) {
        boolean showCorrectAnswers =
                Boolean.TRUE.equals(
                        setting.getShowCorrectAnswers()
                );

        List<QuizResultAnswerResponse> resultAnswers =
                answers.stream()
                        .map(answer -> {
                            QuizOption correctOption =
                                    showCorrectAnswers
                                            ? optionRepository
                                                    .findByQuestionIdAndCorrectTrueAndDeletedAtIsNull(
                                                            answer.getQuestion().getId()
                                                    )
                                                    .orElse(null)
                                            : null;

                            return new QuizResultAnswerResponse(
                                    answer,
                                    correctOption,
                                    showCorrectAnswers
                            );
                        })
                        .toList();

        return new QuizResultResponse(
                attempt,
                setting,
                resultAnswers
        );
    }

    private BigDecimal calculateScore(
            BigDecimal earnedPoints,
            BigDecimal totalPoints
    ) {
        if (
                totalPoints == null
                        || totalPoints.compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {
            throw new BadRequestException(
                    "El puntaje total del cuestionario debe ser mayor a cero"
            );
        }

        return earnedPoints
                .multiply(
                        new BigDecimal("100")
                )
                .divide(
                        totalPoints,
                        SCORE_SCALE,
                        RoundingMode.HALF_UP
                );
    }

    private int calculateRemainingAttempts(
            Long studentId,
            Long lessonId,
            Integer maxAttempts
    ) {
        long usedAttempts =
                attemptRepository
                        .countByStudentIdAndLessonId(
                                studentId,
                                lessonId
                        );

        long remaining =
                maxAttempts - usedAttempts;

        return Math.max(
                Math.toIntExact(remaining),
                0
        );
    }

    private QuizSetting findQuizSetting(
            Long lessonId
    ) {
        return settingRepository
                .findByLessonId(lessonId)
                .orElseThrow(() ->
                        new BadRequestException(
                                "El cuestionario todavia no ha sido configurado"
                        )
                );
    }

    private Lesson findAvailableQuizLesson(
            Long lessonId
    ) {
        Lesson lesson =
                lessonRepository
                        .findByIdAndDeletedAtIsNull(
                                lessonId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Leccion no encontrada"
                                )
                        );

        if (
                lesson.getLessonType()
                        != LessonType.QUIZ
        ) {
            throw new BadRequestException(
                    "La leccion seleccionada no es de tipo QUIZ"
            );
        }

        if (
                !Boolean.TRUE.equals(
                        lesson.getActive()
                )
        ) {
            throw new BadRequestException(
                    "El cuestionario no esta disponible"
            );
        }

        return lesson;
    }

    private void validateAttempt(
            QuizAttempt attempt,
            Long lessonId
    ) {
        if (
                attempt.getLesson() == null
                        || !attempt.getLesson()
                                .getId()
                                .equals(lessonId)
        ) {
            throw new BadRequestException(
                    "El intento no pertenece al cuestionario indicado"
            );
        }

        if (attempt.isCompleted()) {
            throw new BadRequestException(
                    "El intento ya fue finalizado"
            );
        }

        if (
                answerRepository.countByAttemptId(
                        attempt.getId()
                ) > 0
        ) {
            throw new BadRequestException(
                    "El intento ya contiene respuestas registradas"
            );
        }
    }

    private void validateStudent(
            User student
    ) {
        if (student == null) {
            throw new BadRequestException(
                    "No se pudo identificar al estudiante"
            );
        }

        if (
                student.getRole()
                        != UserRole.STUDENT
        ) {
            throw new BadRequestException(
                    "Solo los estudiantes pueden resolver cuestionarios"
            );
        }
    }
}