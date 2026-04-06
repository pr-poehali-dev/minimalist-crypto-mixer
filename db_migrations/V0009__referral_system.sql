
CREATE TABLE referral_codes (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE referral_links (
    id SERIAL PRIMARY KEY,
    referrer_username VARCHAR(255) NOT NULL,
    referred_username VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE referral_earnings (
    id SERIAL PRIMARY KEY,
    referrer_username VARCHAR(255) NOT NULL,
    referred_username VARCHAR(255) NOT NULL,
    exchange_id INTEGER NOT NULL,
    amount_usd NUMERIC(20,8) NOT NULL,
    currency VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'начислено',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE referral_withdrawals (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    amount_usd NUMERIC(20,8) NOT NULL,
    wallet_address TEXT NOT NULL,
    currency VARCHAR(50) NOT NULL DEFAULT 'USDT',
    status VARCHAR(50) DEFAULT 'Ожидает',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL
);

CREATE INDEX idx_referral_links_referrer ON referral_links(referrer_username);
CREATE INDEX idx_referral_earnings_referrer ON referral_earnings(referrer_username);
CREATE INDEX idx_referral_withdrawals_username ON referral_withdrawals(username);
