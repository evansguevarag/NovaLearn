CREATE TABLE assignments (
    id BIGSERIAL PRIMARY KEY,
    module_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    available_from TIMESTAMP NULL,
    due_at TIMESTAMP NULL,
    max_score DECIMAL(7,2) NOT NULL DEFAULT 20.00,
    allow_text_submission BOOLEAN NOT NULL DEFAULT TRUE,
    allow_file_submission BOOLEAN NOT NULL DEFAULT TRUE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_assignments_module
        FOREIGN KEY (module_id)
        REFERENCES course_modules(id),

    CONSTRAINT fk_assignments_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id),

    CONSTRAINT chk_assignments_title_not_blank
        CHECK (BTRIM(title) <> ''),

    CONSTRAINT chk_assignments_instructions_not_blank
        CHECK (BTRIM(instructions) <> ''),

    CONSTRAINT chk_assignments_status
        CHECK (
            status IN (
                'DRAFT',
                'PUBLISHED',
                'CLOSED'
            )
        ),

    CONSTRAINT chk_assignments_max_score
        CHECK (max_score > 0),

    CONSTRAINT chk_assignments_submission_type
        CHECK (
            allow_text_submission = TRUE
            OR allow_file_submission = TRUE
        ),

    CONSTRAINT chk_assignments_dates
        CHECK (
            available_from IS NULL
            OR due_at IS NULL
            OR due_at > available_from
        ),

    CONSTRAINT chk_assignments_published_at
        CHECK (
            status <> 'PUBLISHED'
            OR published_at IS NOT NULL
        )
);

CREATE TABLE assignment_attachments (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    file_asset_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignment_attachments_assignment
        FOREIGN KEY (assignment_id)
        REFERENCES assignments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignment_attachments_file
        FOREIGN KEY (file_asset_id)
        REFERENCES file_assets(id),

    CONSTRAINT uq_assignment_attachments_assignment_file
        UNIQUE (assignment_id, file_asset_id)
);

CREATE TABLE assignment_submissions (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    submission_text TEXT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    submitted_at TIMESTAMP NULL,
    score DECIMAL(7,2) NULL,
    feedback TEXT NULL,
    graded_by BIGINT NULL,
    graded_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_assignment_submissions_assignment
        FOREIGN KEY (assignment_id)
        REFERENCES assignments(id),

    CONSTRAINT fk_assignment_submissions_student
        FOREIGN KEY (student_id)
        REFERENCES users(id),

    CONSTRAINT fk_assignment_submissions_graded_by
        FOREIGN KEY (graded_by)
        REFERENCES users(id),

    CONSTRAINT uq_assignment_submissions_assignment_student
        UNIQUE (assignment_id, student_id),

    CONSTRAINT chk_assignment_submissions_status
        CHECK (
            status IN (
                'DRAFT',
                'SUBMITTED',
                'LATE',
                'GRADED',
                'RETURNED'
            )
        ),

    CONSTRAINT chk_assignment_submissions_score
        CHECK (
            score IS NULL
            OR score >= 0
        ),

    CONSTRAINT chk_assignment_submissions_submitted_at
        CHECK (
            status = 'DRAFT'
            OR submitted_at IS NOT NULL
        ),

    CONSTRAINT chk_assignment_submissions_grading
        CHECK (
            status NOT IN (
                'GRADED',
                'RETURNED'
            )
            OR (
                score IS NOT NULL
                AND graded_by IS NOT NULL
                AND graded_at IS NOT NULL
            )
        )
);

CREATE TABLE assignment_submission_attachments (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    file_asset_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignment_submission_files_submission
        FOREIGN KEY (submission_id)
        REFERENCES assignment_submissions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignment_submission_files_file
        FOREIGN KEY (file_asset_id)
        REFERENCES file_assets(id),

    CONSTRAINT uq_assignment_submission_files
        UNIQUE (submission_id, file_asset_id)
);

CREATE INDEX idx_assignments_module
    ON assignments(module_id);

CREATE INDEX idx_assignments_creator
    ON assignments(created_by);

CREATE INDEX idx_assignments_status
    ON assignments(status);

CREATE INDEX idx_assignments_due_at
    ON assignments(due_at);

CREATE INDEX idx_assignments_module_status_order
    ON assignments(
        module_id,
        status,
        due_at
    )
    WHERE deleted_at IS NULL;

CREATE INDEX idx_assignment_attachments_assignment
    ON assignment_attachments(assignment_id);

CREATE INDEX idx_assignment_submissions_assignment
    ON assignment_submissions(assignment_id);

CREATE INDEX idx_assignment_submissions_student
    ON assignment_submissions(student_id);

CREATE INDEX idx_assignment_submissions_status
    ON assignment_submissions(status);

CREATE INDEX idx_assignment_submissions_grader
    ON assignment_submissions(graded_by);

CREATE INDEX idx_assignment_submissions_student_status
    ON assignment_submissions(
        student_id,
        status,
        submitted_at DESC
    )
    WHERE deleted_at IS NULL;

CREATE INDEX idx_assignment_submission_files_submission
    ON assignment_submission_attachments(submission_id);