CREATE TABLE evaluations (
    id BIGSERIAL PRIMARY KEY,
    module_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    evaluation_type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    available_from TIMESTAMP,
    due_at TIMESTAMP,
    time_limit_minutes INTEGER,
    max_attempts INTEGER NOT NULL DEFAULT 1,

    max_score NUMERIC(7, 2) NOT NULL DEFAULT 20.00,
    passing_score NUMERIC(7, 2),

    shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
    show_results BOOLEAN NOT NULL DEFAULT TRUE,
    show_correct_answers BOOLEAN NOT NULL DEFAULT FALSE,

    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_evaluations_module
        FOREIGN KEY (module_id)
        REFERENCES course_modules(id),

    CONSTRAINT fk_evaluations_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id),

    CONSTRAINT ck_evaluations_type
        CHECK (
            evaluation_type IN (
                'QUIZ',
                'PRACTICE',
                'MIDTERM',
                'FINAL_EXAM'
            )
        ),

    CONSTRAINT ck_evaluations_status
        CHECK (
            status IN (
                'DRAFT',
                'PUBLISHED',
                'CLOSED'
            )
        ),

    CONSTRAINT ck_evaluations_time_limit
        CHECK (
            time_limit_minutes IS NULL
            OR time_limit_minutes > 0
        ),

    CONSTRAINT ck_evaluations_max_attempts
        CHECK (max_attempts > 0),

    CONSTRAINT ck_evaluations_max_score
        CHECK (max_score > 0),

    CONSTRAINT ck_evaluations_passing_score
        CHECK (
            passing_score IS NULL
            OR (
                passing_score >= 0
                AND passing_score <= max_score
            )
        ),

    CONSTRAINT ck_evaluations_dates
        CHECK (
            available_from IS NULL
            OR due_at IS NULL
            OR due_at > available_from
        )
);

CREATE INDEX idx_evaluations_module
    ON evaluations(module_id);

CREATE INDEX idx_evaluations_created_by
    ON evaluations(created_by);

CREATE INDEX idx_evaluations_status
    ON evaluations(status);

CREATE INDEX idx_evaluations_type
    ON evaluations(evaluation_type);

CREATE INDEX idx_evaluations_due_at
    ON evaluations(due_at);

CREATE INDEX idx_evaluations_active
    ON evaluations(module_id, status)
    WHERE deleted_at IS NULL;


CREATE TABLE evaluation_questions (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id BIGINT NOT NULL,

    question_type VARCHAR(30) NOT NULL,
    prompt TEXT NOT NULL,
    explanation TEXT,

    points NUMERIC(7, 2) NOT NULL DEFAULT 1.00,
    sort_order INTEGER NOT NULL DEFAULT 1,
    required BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_evaluation_questions_evaluation
        FOREIGN KEY (evaluation_id)
        REFERENCES evaluations(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_evaluation_questions_type
        CHECK (
            question_type IN (
                'SINGLE_CHOICE',
                'MULTIPLE_CHOICE',
                'TRUE_FALSE',
                'SHORT_ANSWER'
            )
        ),

    CONSTRAINT ck_evaluation_questions_points
        CHECK (points > 0),

    CONSTRAINT ck_evaluation_questions_sort_order
        CHECK (sort_order > 0)
);

CREATE INDEX idx_evaluation_questions_evaluation
    ON evaluation_questions(evaluation_id);

CREATE UNIQUE INDEX uq_evaluation_questions_sort_order_active
    ON evaluation_questions(evaluation_id, sort_order)
    WHERE deleted_at IS NULL;


CREATE TABLE evaluation_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,

    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_evaluation_options_question
        FOREIGN KEY (question_id)
        REFERENCES evaluation_questions(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_evaluation_options_sort_order
        CHECK (sort_order > 0)
);

CREATE INDEX idx_evaluation_options_question
    ON evaluation_options(question_id);

CREATE UNIQUE INDEX uq_evaluation_options_sort_order_active
    ON evaluation_options(question_id, sort_order)
    WHERE deleted_at IS NULL;


CREATE TABLE evaluation_attempts (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,

    attempt_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',

    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,

    score NUMERIC(7, 2),
    passed BOOLEAN,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evaluation_attempts_evaluation
        FOREIGN KEY (evaluation_id)
        REFERENCES evaluations(id),

    CONSTRAINT fk_evaluation_attempts_student
        FOREIGN KEY (student_id)
        REFERENCES users(id),

    CONSTRAINT uq_evaluation_attempts_number
        UNIQUE (
            evaluation_id,
            student_id,
            attempt_number
        ),

    CONSTRAINT ck_evaluation_attempts_number
        CHECK (attempt_number > 0),

    CONSTRAINT ck_evaluation_attempts_status
        CHECK (
            status IN (
                'IN_PROGRESS',
                'SUBMITTED',
                'GRADED'
            )
        ),

    CONSTRAINT ck_evaluation_attempts_score
        CHECK (
            score IS NULL
            OR score >= 0
        )
);

CREATE INDEX idx_evaluation_attempts_evaluation
    ON evaluation_attempts(evaluation_id);

CREATE INDEX idx_evaluation_attempts_student
    ON evaluation_attempts(student_id);

CREATE INDEX idx_evaluation_attempts_status
    ON evaluation_attempts(status);


CREATE TABLE evaluation_attempt_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,

    text_answer TEXT,
    is_correct BOOLEAN,
    points_earned NUMERIC(7, 2),

    answered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evaluation_attempt_answers_attempt
        FOREIGN KEY (attempt_id)
        REFERENCES evaluation_attempts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_evaluation_attempt_answers_question
        FOREIGN KEY (question_id)
        REFERENCES evaluation_questions(id),

    CONSTRAINT uq_evaluation_attempt_answers_question
        UNIQUE (
            attempt_id,
            question_id
        ),

    CONSTRAINT ck_evaluation_attempt_answers_points
        CHECK (
            points_earned IS NULL
            OR points_earned >= 0
        )
);

CREATE INDEX idx_evaluation_attempt_answers_attempt
    ON evaluation_attempt_answers(attempt_id);

CREATE INDEX idx_evaluation_attempt_answers_question
    ON evaluation_attempt_answers(question_id);


CREATE TABLE evaluation_answer_options (
    answer_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,

    PRIMARY KEY (
        answer_id,
        option_id
    ),

    CONSTRAINT fk_evaluation_answer_options_answer
        FOREIGN KEY (answer_id)
        REFERENCES evaluation_attempt_answers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_evaluation_answer_options_option
        FOREIGN KEY (option_id)
        REFERENCES evaluation_options(id)
);


COMMENT ON TABLE evaluations IS
    'Evaluaciones independientes del contenido y vinculadas a un módulo del curso.';

COMMENT ON COLUMN evaluations.module_id IS
    'Semana o módulo al que pertenece la evaluación.';

COMMENT ON COLUMN evaluations.evaluation_type IS
    'QUIZ, PRACTICE, MIDTERM o FINAL_EXAM.';

COMMENT ON TABLE evaluation_questions IS
    'Preguntas pertenecientes a una evaluación independiente.';

COMMENT ON TABLE evaluation_attempts IS
    'Intentos realizados por estudiantes en evaluaciones publicadas.';