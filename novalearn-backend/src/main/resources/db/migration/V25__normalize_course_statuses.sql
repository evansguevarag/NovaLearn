UPDATE courses
SET status = 'DRAFT'
WHERE status IN ('PENDING_REVIEW', 'UNPUBLISHED');

ALTER TABLE courses
    ADD CONSTRAINT chk_courses_status
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));
