package com.novalearn.learning.quiz.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.learning.lesson.entity.Lesson;
import com.novalearn.learning.lesson.repository.LessonRepository;
import com.novalearn.learning.quiz.dto.*;
import com.novalearn.learning.quiz.entity.QuizAttempt;
import com.novalearn.learning.quiz.entity.QuizOption;
import com.novalearn.learning.quiz.entity.QuizQuestion;
import com.novalearn.learning.quiz.repository.QuizAttemptRepository;
import com.novalearn.learning.quiz.repository.QuizOptionRepository;
import com.novalearn.learning.quiz.repository.QuizQuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class QuizService {

    private final QuizQuestionRepository questionRepository;
    private final QuizOptionRepository optionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final LessonRepository lessonRepository;

    public QuizService(
            QuizQuestionRepository questionRepository,
            QuizOptionRepository optionRepository,
            QuizAttemptRepository attemptRepository,
            LessonRepository lessonRepository
    ) {
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.attemptRepository = attemptRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional
    public QuizQuestionResponse createQuestion(QuizQuestionRequest request) {
        Lesson lesson = lessonRepository.findByIdAndDeletedAtIsNull(request.getLessonId())
                .orElseThrow(() -> new IllegalArgumentException("Leccion no encontrada"));

        QuizQuestion question = new QuizQuestion();
        question.setLesson(lesson);
        question.setQuestionText(request.getQuestionText().trim());
        question.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 1);
        question.setActive(request.getActive() != null ? request.getActive() : true);

        return new QuizQuestionResponse(questionRepository.save(question));
    }

    @Transactional
    public QuizOptionResponse createOption(QuizOptionRequest request) {
        QuizQuestion question = questionRepository.findByIdAndDeletedAtIsNull(request.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Pregunta no encontrada"));

        QuizOption option = new QuizOption();
        option.setQuestion(question);
        option.setOptionText(request.getOptionText().trim());
        option.setCorrect(request.getCorrect() != null ? request.getCorrect() : false);
        option.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 1);

        return new QuizOptionResponse(optionRepository.save(option));
    }

    @Transactional(readOnly = true)
    public List<QuizQuestionResponse> findQuestionsByLesson(Long lessonId) {
        return questionRepository.findByLessonIdAndDeletedAtIsNullOrderBySortOrderAsc(lessonId)
                .stream()
                .map(QuizQuestionResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuizOptionResponse> findOptionsByQuestion(Long questionId) {
        return optionRepository.findByQuestionIdAndDeletedAtIsNullOrderBySortOrderAsc(questionId)
                .stream()
                .map(QuizOptionResponse::new)
                .toList();
    }

    @Transactional
    public QuizAttemptResponse submitAttempt(User student, QuizAttemptRequest request) {
        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("Solo los estudiantes pueden resolver quizzes");
        }

        Lesson lesson = lessonRepository.findByIdAndDeletedAtIsNull(request.getLessonId())
                .orElseThrow(() -> new IllegalArgumentException("Leccion no encontrada"));

        int totalQuestions = request.getAnswers().size();
        int correctAnswers = 0;

        for (QuizAnswerRequest answer : request.getAnswers()) {
            QuizOption selectedOption = optionRepository.findByIdAndDeletedAtIsNull(answer.getSelectedOptionId())
                    .orElseThrow(() -> new IllegalArgumentException("Opcion no encontrada"));

            if (!selectedOption.getQuestion().getId().equals(answer.getQuestionId())) {
                throw new IllegalArgumentException("La opcion no pertenece a la pregunta enviada");
            }

            if (Boolean.TRUE.equals(selectedOption.getCorrect())) {
                correctAnswers++;
            }
        }

        BigDecimal score = BigDecimal.valueOf(correctAnswers)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP);

        QuizAttempt attempt = new QuizAttempt();
        attempt.setStudent(student);
        attempt.setLesson(lesson);
        attempt.setTotalQuestions(totalQuestions);
        attempt.setCorrectAnswers(correctAnswers);
        attempt.setScore(score);
        attempt.setPassed(score.compareTo(BigDecimal.valueOf(70)) >= 0);

        return new QuizAttemptResponse(attemptRepository.save(attempt));
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> findAttempts(User student, Long lessonId) {
        return attemptRepository.findByStudentIdAndLessonIdOrderByAttemptedAtDesc(
                        student.getId(),
                        lessonId
                )
                .stream()
                .map(QuizAttemptResponse::new)
                .toList();
    }
}