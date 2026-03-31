-- ============================================================
-- Admin Panel Migration
-- Run ONCE on your existing database
-- ============================================================

-- Add role column to users (default 'user')
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- Add is_blocked column (allows admin to block users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

-- Create the first admin user (update username to match your account)
-- Run manually: UPDATE users SET role = 'admin' WHERE username = 'your_username';

-- Index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ── New tables for v2 features ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS study_plan (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_code TEXT NOT NULL,
    subject_name TEXT,
    study_date DATE NOT NULL,
    duration_hours REAL DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_study_plan_user ON study_plan(user_id, study_date);

CREATE TABLE IF NOT EXISTS vtu_results_cache (
    id SERIAL PRIMARY KEY,
    usn TEXT NOT NULL,
    result_json JSONB NOT NULL,
    semester TEXT,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vtu_cache_usn ON vtu_results_cache(usn);

-- Training v2 — add certificate_id and course metadata
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS certificate_id TEXT;
ALTER TABLE training_courses ADD COLUMN IF NOT EXISTS modules JSONB;
ALTER TABLE training_courses ADD COLUMN IF NOT EXISTS course_url TEXT;
ALTER TABLE training_courses ADD COLUMN IF NOT EXISTS what_you_learn TEXT[];
ALTER TABLE training_courses ADD COLUMN IF NOT EXISTS requirements TEXT[];

-- Resource file upload support
ALTER TABLE vtu_resources ADD COLUMN IF NOT EXISTS file_data TEXT;
