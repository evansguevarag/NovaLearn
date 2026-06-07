CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    instructor_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    short_description VARCHAR(500),
    description TEXT,
    requirements TEXT,
    target_audience TEXT,
    thumbnail_url VARCHAR(1000),
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    course_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    level VARCHAR(50),
    certificate_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_courses_instructor
        FOREIGN KEY (instructor_id) REFERENCES users(id),

    CONSTRAINT fk_courses_category
        FOREIGN KEY (category_id) REFERENCES course_categories(id),

    CONSTRAINT chk_courses_price
        CHECK (price >= 0)
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_courses_status ON courses(status);