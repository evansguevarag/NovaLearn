ALTER TABLE system_settings
    ADD COLUMN payment_processing_fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    ADD COLUMN payment_processing_fee_tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 18,
    ADD COLUMN pass_processing_fee_to_student BOOLEAN NOT NULL DEFAULT TRUE,
    ADD CONSTRAINT chk_system_settings_payment_processing_fee_percentage
        CHECK (payment_processing_fee_percentage >= 0),
    ADD CONSTRAINT chk_system_settings_payment_processing_fee_tax_percentage
        CHECK (payment_processing_fee_tax_percentage >= 0);
