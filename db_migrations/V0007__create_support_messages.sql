
CREATE TABLE IF NOT EXISTS support_messages (
    id SERIAL PRIMARY KEY,
    user_chat_id BIGINT NOT NULL,
    user_username VARCHAR(255),
    direction VARCHAR(10) NOT NULL DEFAULT 'in',
    message_text TEXT NOT NULL,
    admin_message_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_user ON support_messages(user_chat_id);
CREATE INDEX idx_support_admin_msg ON support_messages(admin_message_id);
