CREATE TABLE certificates (
    id BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT NOT NULL UNIQUE,
    certificate_code VARCHAR(100) NOT NULL UNIQUE,
    certificate_url VARCHAR(1000),
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_certificates_enrollment
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
);

CREATE INDEX idx_certificates_code ON certificates(certificate_code);
CREATE INDEX idx_certificates_enrollment ON certificates(enrollment_id);