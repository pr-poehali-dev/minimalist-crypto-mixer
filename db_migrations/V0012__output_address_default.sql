ALTER TABLE exchanges ALTER COLUMN output_address SET DEFAULT '';
UPDATE exchanges SET output_address = '' WHERE output_address IS NULL;