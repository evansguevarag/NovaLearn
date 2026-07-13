ALTER TABLE payments
    ADD COLUMN paid_at TIMESTAMP NULL;

UPDATE payments
SET paid_at = updated_at
WHERE status = 'PAID'
AND paid_at IS NULL;

CREATE INDEX idx_payments_paid_at
    ON payments(paid_at);
