ALTER TABLE payments
    ADD COLUMN provider_order_status VARCHAR(50),
    ADD COLUMN provider_order_expires_at TIMESTAMP;

CREATE INDEX idx_payments_pending_course_amount
    ON payments(student_id, course_id, currency, amount, status);
