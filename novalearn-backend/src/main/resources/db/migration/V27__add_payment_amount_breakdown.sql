ALTER TABLE payments
    ADD COLUMN subtotal_amount DECIMAL(10,2),
    ADD COLUMN processing_fee_amount DECIMAL(10,2),
    ADD COLUMN tax_amount DECIMAL(10,2),
    ADD COLUMN total_amount DECIMAL(10,2);

UPDATE payments
SET subtotal_amount = amount,
    processing_fee_amount = 0,
    tax_amount = 0,
    total_amount = amount
WHERE subtotal_amount IS NULL;

ALTER TABLE payments
    ALTER COLUMN subtotal_amount SET NOT NULL,
    ALTER COLUMN processing_fee_amount SET NOT NULL,
    ALTER COLUMN tax_amount SET NOT NULL,
    ALTER COLUMN total_amount SET NOT NULL,
    ADD CONSTRAINT chk_payments_subtotal_amount
        CHECK (subtotal_amount >= 0),
    ADD CONSTRAINT chk_payments_processing_fee_amount
        CHECK (processing_fee_amount >= 0),
    ADD CONSTRAINT chk_payments_tax_amount
        CHECK (tax_amount >= 0),
    ADD CONSTRAINT chk_payments_total_amount
        CHECK (total_amount >= 0);
