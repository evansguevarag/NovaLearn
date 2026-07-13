ALTER TABLE system_settings
    ADD COLUMN culqi_payments_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN manual_payments_enabled BOOLEAN NOT NULL DEFAULT TRUE;
