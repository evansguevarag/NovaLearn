CREATE TABLE auth_login_otps (
    id BIGSERIAL PRIMARY KEY,
    challenge_id VARCHAR(36) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    code_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    consumed_at TIMESTAMP,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_login_otps_user_id
    ON auth_login_otps(user_id);

CREATE INDEX idx_auth_login_otps_challenge_active
    ON auth_login_otps(challenge_id, consumed_at, expires_at);
