ALTER TABLE evaluations
    ADD COLUMN delivery_mode VARCHAR(30) NOT NULL DEFAULT 'ONLINE_QUIZ',
    ADD COLUMN instructions TEXT,
    ADD COLUMN allow_late_submission BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN max_files INTEGER,
    ADD COLUMN max_file_size_mb INTEGER,
    ADD COLUMN allowed_file_extensions VARCHAR(500),
    ADD COLUMN visible_in_content BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 1;

ALTER TABLE evaluations
    ADD CONSTRAINT ck_evaluations_delivery_mode
        CHECK (
            delivery_mode IN (
                'ONLINE_QUIZ',
                'TEXT_SUBMISSION',
                'FILE_SUBMISSION',
                'HYBRID'
            )
        ),
    ADD CONSTRAINT ck_evaluations_max_files
        CHECK (
            max_files IS NULL
            OR max_files > 0
        ),
    ADD CONSTRAINT ck_evaluations_max_file_size
        CHECK (
            max_file_size_mb IS NULL
            OR max_file_size_mb > 0
        ),
    ADD CONSTRAINT ck_evaluations_sort_order
        CHECK (sort_order > 0);

CREATE INDEX idx_evaluations_content_visibility
    ON evaluations(
        module_id,
        visible_in_content,
        status,
        sort_order
    )
    WHERE deleted_at IS NULL;


CREATE TABLE evaluation_attachments (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id BIGINT NOT NULL,
    file_asset_id BIGINT NOT NULL,
    display_name VARCHAR(255),
    sort_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_evaluation_attachments_evaluation
        FOREIGN KEY (evaluation_id)
        REFERENCES evaluations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_evaluation_attachments_file_asset
        FOREIGN KEY (file_asset_id)
        REFERENCES file_assets(id),

    CONSTRAINT uq_evaluation_attachments_asset
        UNIQUE (
            evaluation_id,
            file_asset_id
        ),

    CONSTRAINT ck_evaluation_attachments_sort_order
        CHECK (sort_order > 0)
);

CREATE INDEX idx_evaluation_attachments_evaluation
    ON evaluation_attachments(evaluation_id);

CREATE INDEX idx_evaluation_attachments_file_asset
    ON evaluation_attachments(file_asset_id);


CREATE TABLE evaluation_submissions (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,

    text_answer TEXT,
    student_comment TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    submitted_at TIMESTAMP,

    score NUMERIC(7, 2),
    feedback TEXT,
    graded_by BIGINT,
    graded_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_evaluation_submissions_evaluation
        FOREIGN KEY (evaluation_id)
        REFERENCES evaluations(id),

    CONSTRAINT fk_evaluation_submissions_student
        FOREIGN KEY (student_id)
        REFERENCES users(id),

    CONSTRAINT fk_evaluation_submissions_graded_by
        FOREIGN KEY (graded_by)
        REFERENCES users(id),

    CONSTRAINT uq_evaluation_submissions_attempt
        UNIQUE (
            evaluation_id,
            student_id,
            attempt_number
        ),

    CONSTRAINT ck_evaluation_submissions_attempt_number
        CHECK (attempt_number > 0),

    CONSTRAINT ck_evaluation_submissions_status
        CHECK (
            status IN (
                'DRAFT',
                'SUBMITTED',
                'LATE',
                'GRADED',
                'RETURNED'
            )
        ),

    CONSTRAINT ck_evaluation_submissions_score
        CHECK (
            score IS NULL
            OR score >= 0
        )
);

CREATE INDEX idx_evaluation_submissions_evaluation
    ON evaluation_submissions(evaluation_id);

CREATE INDEX idx_evaluation_submissions_student
    ON evaluation_submissions(student_id);

CREATE INDEX idx_evaluation_submissions_status
    ON evaluation_submissions(status);

CREATE INDEX idx_evaluation_submissions_pending_grading
    ON evaluation_submissions(
        evaluation_id,
        status
    )
    WHERE deleted_at IS NULL;


CREATE TABLE evaluation_submission_attachments (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    file_asset_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_evaluation_submission_attachments_submission
        FOREIGN KEY (submission_id)
        REFERENCES evaluation_submissions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_evaluation_submission_attachments_file_asset
        FOREIGN KEY (file_asset_id)
        REFERENCES file_assets(id),

    CONSTRAINT uq_evaluation_submission_attachments_asset
        UNIQUE (
            submission_id,
            file_asset_id
        )
);

CREATE INDEX idx_evaluation_submission_attachments_submission
    ON evaluation_submission_attachments(submission_id);

CREATE INDEX idx_evaluation_submission_attachments_file_asset
    ON evaluation_submission_attachments(file_asset_id);


COMMENT ON COLUMN evaluations.delivery_mode IS
    'ONLINE_QUIZ, TEXT_SUBMISSION, FILE_SUBMISSION o HYBRID.';

COMMENT ON COLUMN evaluations.visible_in_content IS
    'Indica si una evaluación publicada aparece dentro del recorrido del módulo.';

COMMENT ON COLUMN evaluations.sort_order IS
    'Orden de la evaluación dentro del módulo.';

COMMENT ON TABLE evaluation_attachments IS
    'Archivos proporcionados por el instructor para desarrollar la evaluación.';

COMMENT ON TABLE evaluation_submissions IS
    'Entregas de texto o archivos realizadas por estudiantes.';

COMMENT ON TABLE evaluation_submission_attachments IS
    'Archivos adjuntos pertenecientes a una entrega de evaluación.';