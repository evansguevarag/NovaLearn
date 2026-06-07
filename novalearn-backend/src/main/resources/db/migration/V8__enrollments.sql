CREATE TABLE enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_enrollments_student
        FOREIGN KEY (student_id) REFERENCES users(id),

    CONSTRAINT fk_enrollments_course
        FOREIGN KEY (course_id) REFERENCES courses(id),

    CONSTRAINT uq_enrollments_student_course
        UNIQUE (student_id, course_id),

    CONSTRAINT chk_enrollments_progress
        CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);