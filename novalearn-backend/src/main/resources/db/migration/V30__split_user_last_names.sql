ALTER TABLE users
    ADD COLUMN paternal_last_name VARCHAR(100),
    ADD COLUMN maternal_last_name VARCHAR(100);

UPDATE users
SET paternal_last_name = NULLIF(split_part(trim(last_name), ' ', 1), '')
WHERE last_name IS NOT NULL
  AND trim(last_name) <> '';

UPDATE users
SET maternal_last_name = NULLIF(
        trim(regexp_replace(trim(last_name), '^\S+\s*', '')),
        ''
    )
WHERE last_name IS NOT NULL
  AND trim(last_name) <> '';
