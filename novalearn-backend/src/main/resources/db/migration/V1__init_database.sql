-- NovaLearn initial Flyway migration
-- This migration validates PostgreSQL + Flyway integration.

CREATE TABLE flyway_test (
    id BIGSERIAL PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);