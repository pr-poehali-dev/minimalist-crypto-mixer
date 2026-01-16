-- Create mixes table
CREATE TABLE IF NOT EXISTS mixes (
    id SERIAL PRIMARY KEY,
    user_username VARCHAR(255) NOT NULL,
    currency VARCHAR(50) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    fee VARCHAR(10) NOT NULL,
    delay VARCHAR(50) NOT NULL,
    minimum VARCHAR(50) NOT NULL,
    preset VARCHAR(100) NOT NULL,
    input_address TEXT NOT NULL,
    output_address TEXT NOT NULL,
    deposit_address TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'В процессе',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster user queries
CREATE INDEX idx_mixes_username ON mixes(user_username);
CREATE INDEX idx_mixes_status ON mixes(status);
CREATE INDEX idx_mixes_created_at ON mixes(created_at DESC);