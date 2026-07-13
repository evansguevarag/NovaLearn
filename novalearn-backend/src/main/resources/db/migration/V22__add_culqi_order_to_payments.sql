ALTER TABLE payments
    ADD COLUMN provider_order_id VARCHAR(255);

CREATE INDEX idx_payments_provider_order_id
    ON payments(provider_order_id);
