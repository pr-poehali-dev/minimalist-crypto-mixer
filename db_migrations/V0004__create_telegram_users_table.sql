
CREATE TABLE IF NOT EXISTS telegram_users (
    id SERIAL PRIMARY KEY,
    telegram_username VARCHAR(255) UNIQUE NOT NULL,
    chat_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_telegram_users_username ON telegram_users(telegram_username);
CREATE INDEX idx_telegram_users_chat_id ON telegram_users(chat_id);
