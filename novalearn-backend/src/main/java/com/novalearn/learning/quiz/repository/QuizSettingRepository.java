package com.novalearn.learning.quiz.repository;

import com.novalearn.learning.quiz.entity.QuizSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface QuizSettingRepository
        extends JpaRepository<QuizSetting, Long> {

        Optional<QuizSetting> findByLessonId(
                Long lessonId
        );

        boolean existsByLessonId(
                Long lessonId
        );

        void deleteByLessonId(
                Long lessonId
        );
}