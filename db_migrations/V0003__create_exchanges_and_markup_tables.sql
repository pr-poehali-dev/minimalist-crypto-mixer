
CREATE TABLE IF NOT EXISTS exchanges (
    id SERIAL PRIMARY KEY,
    user_username VARCHAR(255) NOT NULL,
    from_currency VARCHAR(50) NOT NULL,
    to_currency VARCHAR(50) NOT NULL,
    from_amount DECIMAL(20,8) NOT NULL,
    to_amount DECIMAL(20,8) NOT NULL,
    rate DECIMAL(20,8) NOT NULL,
    deposit_address TEXT,
    output_address TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Ожидает оплаты',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exchanges_user ON exchanges(user_username);
CREATE INDEX idx_exchanges_status ON exchanges(status);
CREATE INDEX idx_exchanges_created ON exchanges(created_at DESC);

CREATE TABLE IF NOT EXISTS exchange_markup (
    id SERIAL PRIMARY KEY,
    markup_percent DECIMAL(5,2) DEFAULT 2.00,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO exchange_markup (markup_percent, updated_by) VALUES (2.00, 'system');
