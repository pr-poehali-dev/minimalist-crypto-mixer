CREATE TABLE IF NOT EXISTS auth_sessions (
    id SERIAL PRIMARY KEY,
    telegram_username VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 minutes',
    verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_telegram_username ON auth_sessions(telegram_username);
CREATE INDEX idx_expires_at ON auth_sessions(expires_at);
