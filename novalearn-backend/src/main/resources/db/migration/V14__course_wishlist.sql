CREATE TABLE course_wishlist (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_course_wishlist_student
        FOREIGN KEY (student_id) REFERENCES users(id),

    CONSTRAINT fk_course_wishlist_course
        FOREIGN KEY (course_id) REFERENCES courses(id),

    CONSTRAINT uq_course_wishlist_student_course
        UNIQUE (student_id, course_id)
);

CREATE INDEX idx_course_wishlist_student ON course_wishlist(student_id);
CREATE INDEX idx_course_wishlist_course ON course_wishlist(course_id);