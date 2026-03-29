-- ============================================================
-- Campus Connect — Full Database Migration
-- Run this ONCE on your existing database to add all new features
-- Safe to run multiple times (uses IF NOT EXISTS / IF NOT EXISTS)
-- ============================================================

-- ── 1. Users table additions ──────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS role         TEXT    NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS year_scheme  TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username     TEXT;    -- already exists but safe

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ── 2. Marks table ────────────────────────────────────────────────────────────
-- is_failed is a generated column (already in init.sql if fresh install)
-- ALTER TABLE marks ADD COLUMN IF NOT EXISTS is_failed BOOLEAN GENERATED ALWAYS AS (total < 40) STORED;
-- Skip above if it already exists — the CHECK below handles it safely

-- ── 3. Enrollments — certificate tracking ────────────────────────────────────
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS certificate_id TEXT;

-- ── 4. Training courses — real course metadata ───────────────────────────────
ALTER TABLE training_courses ADD COLUMN IF NOT EXISTS modules        JSONB;
ALTER TABLE training_courses ADD COLUMN IF NOT EXISTS course_url     TEXT;
ALTER TABLE training_courses ADD COLUMN IF NOT EXISTS what_you_learn TEXT[];
ALTER TABLE training_courses ADD COLUMN IF NOT EXISTS requirements   TEXT[];

-- ── 5. Password reset tokens (Forgot Password feature) ───────────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         SERIAL  PRIMARY KEY,
    user_id    INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    token      TEXT    NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used       BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);

-- ── 6. Notifications ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         SERIAL  PRIMARY KEY,
    user_id    INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    type       TEXT    NOT NULL,   -- marks | backlog | placement | resource | announcement
    title      TEXT    NOT NULL,
    body       TEXT    NOT NULL,
    link       TEXT,
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);

-- ── 7. Study Planner ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_plan (
    id             SERIAL  PRIMARY KEY,
    user_id        INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_code   TEXT    NOT NULL,
    subject_name   TEXT,
    study_date     DATE    NOT NULL,
    duration_hours REAL    DEFAULT 1,
    completed      BOOLEAN DEFAULT FALSE,
    notes          TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_study_plan_user ON study_plan(user_id, study_date);

-- ── 8. VTU Results Cache ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vtu_results_cache (
    id          SERIAL PRIMARY KEY,
    usn         TEXT   NOT NULL,
    result_json JSONB  NOT NULL,
    semester    TEXT,
    fetched_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vtu_cache_usn ON vtu_results_cache(usn);

-- ── 9. Update training course URLs (run to add real course links) ─────────────
UPDATE training_courses SET
  course_url = 'https://nptel.ac.in/courses/111/108/111108081/',
  what_you_learn = ARRAY['Laplace transforms','Fourier series','Z-transforms','VTU PYQs']
WHERE subject_code = '21MAT11' AND course_url IS NULL;

UPDATE training_courses SET
  course_url = 'https://nptel.ac.in/courses/115/102/115102023/',
  what_you_learn = ARRAY['Quantum mechanics','Laser principles','Optical fibres','Superconductivity']
WHERE subject_code = '21PHY12' AND course_url IS NULL;

UPDATE training_courses SET
  course_url = 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y',
  what_you_learn = ARRAY['ER diagrams','Normalization 1NF-BCNF','SQL DDL/DML','Transactions and ACID']
WHERE subject_code = '21CS32' AND course_url IS NULL;

UPDATE training_courses SET
  course_url = 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz',
  what_you_learn = ARRAY['Arrays and linked lists','Tree traversal','Graph BFS/DFS','Sorting algorithms']
WHERE title ILIKE '%data structures%' AND course_url IS NULL;

UPDATE training_courses SET
  course_url = 'https://www.youtube.com/playlist?list=PLu0W_9lII9agwh1XjRt242xIpHhPT2llg',
  what_you_learn = ARRAY['Python OOP','File handling','NumPy and Pandas','Coding interview patterns']
WHERE title ILIKE '%python%' AND course_url IS NULL;

-- ── 10. Make yourself admin (EDIT this line) ──────────────────────────────────
-- UPDATE users SET role = 'admin' WHERE username = 'YOUR_USERNAME_HERE';

-- ── Done ─────────────────────────────────────────────────────────────────────
SELECT 'Migration complete!' AS status;
