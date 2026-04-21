-- ═══════════════════════════════════════════════════════════════
-- Campus Connect — Migration v3
-- Adds: Internship Programs, Project Listings, Custom Project Requests
-- ═══════════════════════════════════════════════════════════════

-- ── Internship Programs (admin-managed) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS internship_programs (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  company          VARCHAR(255) NOT NULL,
  description      TEXT,
  duration         VARCHAR(100),           -- e.g. "6 weeks", "3 months"
  stipend          VARCHAR(100),           -- e.g. "₹5000/month" or "Unpaid"
  skills_covered   TEXT[],                 -- array of skill tags
  mode             VARCHAR(50) DEFAULT 'hybrid', -- remote/onsite/hybrid
  eligibility      TEXT,                   -- e.g. "VTU 6th sem and above"
  last_date        DATE,
  start_date       DATE,
  seats            INTEGER DEFAULT 30,
  is_active        BOOLEAN DEFAULT TRUE,
  is_premium       BOOLEAN DEFAULT FALSE,  -- requires premium to apply
  has_certificate  BOOLEAN DEFAULT TRUE,
  has_training_cert BOOLEAN DEFAULT FALSE,
  apply_link       TEXT,
  logo_url         TEXT,
  category         VARCHAR(80) DEFAULT 'general', -- general/technical/management
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Internship Applications (students apply) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS internship_applications (
  id               SERIAL PRIMARY KEY,
  program_id       INTEGER REFERENCES internship_programs(id) ON DELETE CASCADE,
  user_id          INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  status           VARCHAR(50) DEFAULT 'pending', -- pending/approved/rejected/completed
  applied_at       TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ,
  reviewed_by      INTEGER REFERENCES users(user_id),
  admin_notes      TEXT,
  student_message  TEXT,
  certificate_issued BOOLEAN DEFAULT FALSE,
  training_cert_issued BOOLEAN DEFAULT FALSE,
  UNIQUE(program_id, user_id)
);

-- ── Project Listings (ready-made, downloadable after payment) ────────────────
CREATE TABLE IF NOT EXISTS project_listings (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  tech_stack       TEXT[],                 -- ["React","Node.js","MongoDB"]
  category         VARCHAR(100),           -- "Web App","ML","Android","IoT" etc.
  level            VARCHAR(50) DEFAULT 'intermediate', -- beginner/intermediate/advanced
  price_paise      INTEGER DEFAULT 0,      -- 0 = free; in paise (₹ × 100)
  preview_url      TEXT,                   -- demo link or screenshot
  download_url     TEXT,                   -- internal path or S3 link (protected)
  thumbnail_url    TEXT,
  tags             TEXT[],
  is_active        BOOLEAN DEFAULT TRUE,
  downloads_count  INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Project Purchases (track who paid for what) ───────────────────────────────
CREATE TABLE IF NOT EXISTS project_purchases (
  id               SERIAL PRIMARY KEY,
  project_id       INTEGER REFERENCES project_listings(id) ON DELETE CASCADE,
  user_id          INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  amount_paise     INTEGER NOT NULL DEFAULT 0,
  payment_id       VARCHAR(255),           -- Razorpay payment_id
  order_id         VARCHAR(255),
  status           VARCHAR(50) DEFAULT 'pending', -- pending/completed/failed
  purchased_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- ── Custom Project Requests (students submit ideas) ───────────────────────────
CREATE TABLE IF NOT EXISTS custom_project_requests (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  description      TEXT NOT NULL,
  tech_preferences TEXT,                   -- preferred technologies
  deadline         DATE,
  budget_paise     INTEGER,                -- student's budget
  final_price_paise INTEGER,              -- admin-set final price
  status           VARCHAR(50) DEFAULT 'pending',
                   -- pending/reviewing/quoted/payment_pending/in_progress/delivered/cancelled
  admin_notes      TEXT,
  delivery_url     TEXT,                   -- link after delivery
  payment_id       VARCHAR(255),
  order_id         VARCHAR(255),
  submitted_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_internship_apps_user   ON internship_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_prog   ON internship_applications(program_id);
CREATE INDEX IF NOT EXISTS idx_project_purchases_user ON project_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_req_user        ON custom_project_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_project_listings_cat   ON project_listings(category);

-- Seed a few sample internship programs
INSERT INTO internship_programs (title, company, description, duration, stipend, skills_covered, mode, eligibility, category, has_certificate, has_training_cert)
VALUES
  ('Full Stack Web Development Internship', 'Campus Connect Tech', 'Hands-on internship covering React, Node.js and PostgreSQL. Build real-world applications with mentorship.', '6 weeks', '₹5,000/month', ARRAY['React','Node.js','PostgreSQL','REST APIs'], 'remote', 'VTU/BCA students 4th sem and above', 'technical', true, true),
  ('Data Science & ML Internship', 'Campus Connect Tech', 'Learn Python, pandas, scikit-learn and build ML models on real datasets.', '8 weeks', '₹6,000/month', ARRAY['Python','Pandas','Scikit-learn','Jupyter','ML'], 'remote', 'VTU/BCA students with basic Python knowledge', 'technical', true, true),
  ('UI/UX Design Internship', 'Campus Connect Tech', 'Master Figma, design systems, user research and prototype real apps.', '4 weeks', '₹3,000/month', ARRAY['Figma','Design Thinking','Prototyping','User Research'], 'remote', 'Open to all streams', 'general', true, false)
ON CONFLICT DO NOTHING;

-- Seed a few sample projects
INSERT INTO project_listings (title, description, tech_stack, category, level, price_paise, tags)
VALUES
  ('Student Management System', 'Complete CRUD-based student management system with admin panel, attendance, and marks management.', ARRAY['React','Node.js','PostgreSQL'], 'Web App', 'intermediate', 49900, ARRAY['DBMS','CRUD','Admin Panel']),
  ('Hospital Appointment Booking', 'Doctor appointment booking with patient records, SMS reminders and admin dashboard.', ARRAY['React','Express','MongoDB'], 'Web App', 'intermediate', 79900, ARRAY['Healthcare','Booking','SMS']),
  ('ML Spam Classifier', 'Email/SMS spam detection using Naive Bayes and SVM with web UI.', ARRAY['Python','Flask','Scikit-learn'], 'Machine Learning', 'beginner', 29900, ARRAY['NLP','Classification','Python']),
  ('Android Expense Tracker', 'Mobile expense tracker with charts, categories and budget alerts.', ARRAY['Android','Java','SQLite'], 'Android', 'intermediate', 59900, ARRAY['Mobile','Finance','Charts']),
  ('IoT Home Automation', 'Control home appliances via ESP32, MQTT and mobile app.', ARRAY['Arduino','ESP32','MQTT','React Native'], 'IoT', 'advanced', 99900, ARRAY['IoT','Arduino','Smart Home'])
ON CONFLICT DO NOTHING;
