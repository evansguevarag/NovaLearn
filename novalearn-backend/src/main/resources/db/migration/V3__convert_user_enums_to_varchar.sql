ALTER TABLE users
    ALTER COLUMN role TYPE VARCHAR(50)
    USING role::text;

ALTER TABLE users
    ALTER COLUMN status TYPE VARCHAR(50)
    USING status::text;

DROP TYPE IF EXISTS user_role;

DROP TYPE IF EXISTS user_status;