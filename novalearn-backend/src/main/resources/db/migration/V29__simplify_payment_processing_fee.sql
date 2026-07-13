ALTER TABLE system_settings
    ALTER COLUMN payment_processing_fee_percentage SET DEFAULT 4.02,
    ALTER COLUMN payment_processing_fee_tax_percentage SET DEFAULT 0;

UPDATE system_settings
SET payment_processing_fee_percentage = 4.02
WHERE payment_processing_fee_percentage = 0;

UPDATE system_settings
SET payment_processing_fee_tax_percentage = 0;
