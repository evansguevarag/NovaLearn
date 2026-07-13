ALTER TABLE payments
    ADD COLUMN manual_method VARCHAR(50),
    ADD COLUMN manual_reference VARCHAR(150),
    ADD COLUMN manual_proof_url VARCHAR(1000),
    ADD COLUMN manual_proof_public_id VARCHAR(500),
    ADD COLUMN manual_proof_resource_type VARCHAR(50),
    ADD COLUMN manual_reviewed_by BIGINT,
    ADD COLUMN manual_reviewed_at TIMESTAMP,
    ADD COLUMN manual_rejection_reason VARCHAR(500);

ALTER TABLE payments
    ADD CONSTRAINT fk_payments_manual_reviewed_by
        FOREIGN KEY (manual_reviewed_by) REFERENCES users(id);

CREATE INDEX idx_payments_provider_status
    ON payments(provider, status);

CREATE INDEX idx_payments_manual_reviewed_by
    ON payments(manual_reviewed_by);
