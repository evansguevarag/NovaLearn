UPDATE users
SET status = 'INACTIVE'
WHERE status IN (
    'PENDING_VERIFICATION',
    'SUSPENDED',
    'BLOCKED',
    'DELETED'
);

ALTER TABLE users
    ADD CONSTRAINT chk_users_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'));
