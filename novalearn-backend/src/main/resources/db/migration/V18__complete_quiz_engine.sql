CREATE TABLE quiz_settings (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    passing_score DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
    shuffle_options BOOLEAN NOT NULL DEFAULT FALSE,
    show_result BOOLEAN NOT NULL DEFAULT TRUE,
    show_correct_answers BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_quiz_settings_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id),

    CONSTRAINT uq_quiz_settings_lesson
        UNIQUE (lesson_id),

    CONSTRAINT chk_quiz_settings_passing_score
        CHECK (
            passing_score >= 0
            AND passing_score <= 100
        ),

    CONSTRAINT chk_quiz_settings_max_attempts
        CHECK (max_attempts >= 1)
);

ALTER TABLE quiz_questions
    ADD COLUMN points DECIMAL(7,2) NOT NULL DEFAULT 1.00,
    ADD COLUMN explanation TEXT NULL;

ALTER TABLE quiz_questions
    ADD CONSTRAINT chk_quiz_questions_points
        CHECK (points > 0);

ALTER TABLE quiz_attempts
    ADD COLUMN attempt_number INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN completed_at TIMESTAMP NULL;

ALTER TABLE quiz_attempts
    ADD CONSTRAINT chk_quiz_attempts_score
        CHECK (
            score >= 0
            AND score <= 100
        ),
    ADD CONSTRAINT chk_quiz_attempts_total_questions
        CHECK (total_questions >= 0),
    ADD CONSTRAINT chk_quiz_attempts_correct_answers
        CHECK (
            correct_answers >= 0
            AND correct_answers <= total_questions
        ),
    ADD CONSTRAINT chk_quiz_attempts_attempt_number
        CHECK (attempt_number >= 1);

CREATE TABLE quiz_attempt_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option_id BIGINT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_earned DECIMAL(7,2) NOT NULL DEFAULT 0,
    answered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_quiz_attempt_answers_attempt
        FOREIGN KEY (attempt_id)
        REFERENCES quiz_attempts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_quiz_attempt_answers_question
        FOREIGN KEY (question_id)
        REFERENCES quiz_questions(id),

    CONSTRAINT fk_quiz_attempt_answers_selected_option
        FOREIGN KEY (selected_option_id)
        REFERENCES quiz_options(id),

    CONSTRAINT uq_quiz_attempt_answers_attempt_question
        UNIQUE (attempt_id, question_id),

    CONSTRAINT chk_quiz_attempt_answers_points
        CHECK (points_earned >= 0)
);

CREATE UNIQUE INDEX uq_quiz_options_single_correct
    ON quiz_options(question_id)
    WHERE (
        is_correct = TRUE
        AND deleted_at IS NULL
    );

CREATE UNIQUE INDEX uq_quiz_attempts_student_lesson_number
    ON quiz_attempts(
        student_id,
        lesson_id,
        attempt_number
    );

CREATE INDEX idx_quiz_questions_lesson_active_order
    ON quiz_questions(
        lesson_id,
        is_active,
        sort_order
    )
    WHERE deleted_at IS NULL;

CREATE INDEX idx_quiz_options_question_active_order
    ON quiz_options(
        question_id,
        sort_order
    )
    WHERE deleted_at IS NULL;

CREATE INDEX idx_quiz_attempts_student_lesson
    ON quiz_attempts(
        student_id,
        lesson_id,
        attempted_at DESC
    );

CREATE INDEX idx_quiz_attempt_answers_attempt
    ON quiz_attempt_answers(attempt_id);

CREATE INDEX idx_quiz_attempt_answers_question
    ON quiz_attempt_answers(question_id);