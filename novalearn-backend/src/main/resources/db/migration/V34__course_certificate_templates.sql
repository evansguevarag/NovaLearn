CREATE TABLE course_certificate_templates (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL UNIQUE,
    template_url VARCHAR(1000) NOT NULL,
    template_public_id VARCHAR(500),
    template_resource_type VARCHAR(50),
    student_name_x NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    student_name_y NUMERIC(5,2) NOT NULL DEFAULT 48.00,
    course_title_x NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    course_title_y NUMERIC(5,2) NOT NULL DEFAULT 36.00,
    issued_at_x NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    issued_at_y NUMERIC(5,2) NOT NULL DEFAULT 26.00,
    certificate_code_x NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    certificate_code_y NUMERIC(5,2) NOT NULL DEFAULT 13.00,
    qr_x NUMERIC(5,2) NOT NULL DEFAULT 82.00,
    qr_y NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    primary_text_color VARCHAR(20) NOT NULL DEFAULT '#111111',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_course_certificate_templates_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE INDEX idx_course_certificate_templates_course
    ON course_certificate_templates(course_id);
