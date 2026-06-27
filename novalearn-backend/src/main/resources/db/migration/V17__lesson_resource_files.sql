ALTER TABLE lessons
    ADD COLUMN resource_file_id BIGINT NULL;

ALTER TABLE lessons
    ADD CONSTRAINT fk_lessons_resource_file
        FOREIGN KEY (resource_file_id)
        REFERENCES file_assets(id);

CREATE INDEX idx_lessons_resource_file
    ON lessons(resource_file_id);