CREATE TABLE course_reviews (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_course_reviews_student
        FOREIGN KEY (student_id) REFERENCES users(id),

    CONSTRAINT fk_course_reviews_course
        FOREIGN KEY (course_id) REFERENCES courses(id),

    CONSTRAINT uq_course_reviews_student_course
        UNIQUE (student_id, course_id),

    CONSTRAINT chk_course_reviews_rating
        CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_course_reviews_course ON course_reviews(course_id);
CREATE INDEX idx_course_reviews_student ON course_reviews(student_id);
CREATE INDEX idx_course_reviews_rating ON course_reviews(rating);