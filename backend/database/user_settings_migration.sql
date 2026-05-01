-- Create user_settings table for Settings page persistence
CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    email_prefs JSONB NOT NULL DEFAULT '{"newsletter": true, "drives": true, "deadlines": true, "updates": true}',
    privacy_settings JSONB NOT NULL DEFAULT '{"profilePublic": false, "showStats": true, "allowMessages": true}',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backfill existing users with default preferences
INSERT INTO user_settings (user_id)
SELECT user_id
FROM users
ON CONFLICT (user_id) DO NOTHING;
