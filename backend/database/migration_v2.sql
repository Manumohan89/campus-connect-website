-- ============================================================
-- Campus Connect v2 Migration
-- Run this if upgrading from v1 (init.sql already run)
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT)
-- ============================================================

-- Add missing columns to users if upgrading
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS year_scheme TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile TEXT;

-- Enrollments: add enrollment_id alias if column named 'id'
-- (Some installs use id, others enrollment_id)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollments' AND column_name='enrollment_id') THEN
    -- nothing needed, id column works fine
    NULL;
  END IF;
END $$;

-- ── Notifications table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'announcement',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications(created_at DESC);

-- ── Coding Platform tables ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coding_problems (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
    difficulty_order INTEGER DEFAULT 2,
    tags TEXT[] DEFAULT '{}',
    constraints TEXT,
    hints JSONB DEFAULT '[]',
    starter_code JSONB DEFAULT '{}',
    test_cases JSONB DEFAULT '[]',
    examples JSONB DEFAULT '[]',
    companies TEXT[] DEFAULT '{}',
    acceptance_rate REAL DEFAULT 0,
    created_by_admin BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coding_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    problem_id INTEGER REFERENCES coding_problems(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    source_code TEXT NOT NULL,
    passed_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_solved_problems (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    problem_id INTEGER REFERENCES coding_problems(id) ON DELETE CASCADE,
    solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    language TEXT,
    PRIMARY KEY (user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_coding_subs_user ON coding_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_solved ON user_solved_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_prob_active ON coding_problems(is_active, difficulty_order);

-- ── Study Plan ────────────────────────────────────────────────────────────
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

-- ── Password Reset Tokens ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);

-- ── Internship Tracker ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS internships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'applied',
    stipend TEXT,
    location TEXT,
    description TEXT,
    offer_letter_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;

-- ── Forum (Peer Doubt Q&A) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    subject_code TEXT,
    tags TEXT[] DEFAULT '{}',
    upvotes INTEGER DEFAULT 0,
    is_solved BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS forum_answers (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS forum_votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    target_id INTEGER NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('post','answer')),
    vote INTEGER DEFAULT 1 CHECK (vote IN (1,-1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_id, target_type)
);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_answers_post ON forum_answers(post_id);

-- ── Subscriptions & Payments ──────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free','premium','college'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_points INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'premium',
    status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','cancelled','pending')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_subscription_id TEXT,
    amount_paise INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    type TEXT,
    amount_paise INTEGER,
    status TEXT,
    gateway_order_id TEXT,
    gateway_payment_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── VTU News ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vtu_news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'circular',
    url TEXT,
    content TEXT,
    content_hash TEXT UNIQUE,
    published_at TIMESTAMP,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vtu_news_cat ON vtu_news(category, fetched_at DESC);

-- ── Leaderboard cache ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leaderboard_cache (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
    score REAL DEFAULT 0,
    cgpa_score REAL DEFAULT 0,
    coding_score REAL DEFAULT 0,
    course_score REAL DEFAULT 0,
    attendance_score REAL DEFAULT 0,
    forum_score REAL DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard_cache(score DESC);

-- ── Push Subscriptions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Flashcards ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_code TEXT,
    title TEXT NOT NULL,
    card_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    deck_id INTEGER REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    ease_factor REAL DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    next_review DATE DEFAULT CURRENT_DATE,
    last_reviewed TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_flashcards_review ON flashcards(deck_id, next_review);

-- ── College partnerships ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS colleges (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    city TEXT,
    contact_email TEXT,
    admin_user_id INTEGER REFERENCES users(user_id),
    subscription_tier TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    student_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Real-time Chat Messages ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    room_key TEXT NOT NULL,
    user_id INTEGER,
    username TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chat_room ON chat_messages(room_key, created_at DESC);

-- ── Job Listings (replaces hardcoded data) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_listings (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'Full-time',
    location TEXT DEFAULT 'Bengaluru',
    tags TEXT[] DEFAULT '{}',
    link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    deadline DATE,
    min_cgpa REAL DEFAULT 0,
    eligible_branches TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed real VTU-relevant job listings
INSERT INTO job_listings (title, company, description, type, location, tags, link, min_cgpa, eligible_branches) VALUES
('Systems Engineer', 'Infosys', 'Entry-level engineering role with 6-month training at Mysuru campus. Part of InfyTQ program. Apply via InfyTQ portal.', 'Full-time', 'Mysuru / Pune', ARRAY['CSE','ISE','ECE','EEE','ME','CV'], 'https://www.infosys.com/careers/apply-jobs.html', 6.0, ARRAY['CSE','ISE','ECE','EEE','ME','CV']),
('Digital/Ninja Track', 'TCS', 'TCS NQT — two tracks. Ninja (3.6 LPA) and Digital (7 LPA). Register on TCS iON portal. Written test + interview.', 'Full-time', 'Pan India', ARRAY['CSE','ISE','ECE','ME','CV','EEE'], 'https://tcsion.com', 6.0, ARRAY['CSE','ISE','ECE','ME','CV','EEE']),
('Project Engineer', 'Wipro', 'Wipro Turbo / Elite program for top performers. Strong aptitude and coding skills required. Assessment on Cocubes.', 'Full-time', 'Bengaluru / Hyderabad', ARRAY['CSE','ISE','ECE'], 'https://careers.wipro.com', 6.5, ARRAY['CSE','ISE','ECE']),
('Associate Software Engineer', 'Accenture', 'Accenture ASE role. Communication, coding, and aptitude round. Eligible 2024/2025 batch.', 'Full-time', 'Bengaluru / Pune', ARRAY['CSE','ISE','ECE'], 'https://www.accenture.com/in-en/careers', 6.0, ARRAY['CSE','ISE','ECE']),
('Software Developer Intern', 'Zepto', '3-month internship at fast-growing quick-commerce startup. React/Node.js stack. Stipend ₹25,000/month.', 'Internship', 'Bengaluru', ARRAY['CSE','ISE','React','Node.js'], 'https://zepto.com/careers', 7.0, ARRAY['CSE','ISE']),
('Backend Developer Intern', 'CRED', 'Backend engineering internship. Python/Java. Work on payments infrastructure. ₹30,000/month.', 'Internship', 'Bengaluru', ARRAY['CSE','ISE','Python','Java'], 'https://cred.club/jobs', 7.5, ARRAY['CSE','ISE']),
('Data Analyst', 'Myntra', 'Data analysis using SQL, Python, and Tableau. Drive product and business decisions.', 'Full-time', 'Bengaluru', ARRAY['CSE','ISE','DS','Data Science','SQL'], 'https://careers.myntra.com', 6.0, ARRAY['CSE','ISE','DS']),
('Embedded Systems Intern', 'Bosch', 'Embedded C programming for automotive ECUs. MATLAB/Simulink exposure preferred.', 'Internship', 'Bengaluru', ARRAY['ECE','EEE','Embedded C','MATLAB'], 'https://www.bosch-career.in', 6.5, ARRAY['ECE','EEE']),
('Automation Engineer', 'Siemens', 'Industrial automation using PLC/SCADA. Core mechanical/electrical background needed.', 'Full-time', 'Bengaluru / Pune', ARRAY['ME','EEE','CV','PLC'], 'https://jobs.siemens.com', 6.0, ARRAY['ME','EEE','CV']),
('Full Stack Developer Intern', 'Juspay', 'Work on payment SDK and checkout UI. React + Haskell/Purescript stack. ₹35,000/month.', 'Internship', 'Bengaluru', ARRAY['CSE','ISE','React','JavaScript'], 'https://juspay.in/jobs', 7.0, ARRAY['CSE','ISE']),
('ML Engineer Intern', 'Sarvam AI', 'Work on Indian language AI models. Python, PyTorch experience. ₹40,000/month.', 'Internship', 'Bengaluru', ARRAY['CSE','ISE','AIML','Python','ML'], 'https://sarvam.ai/careers', 7.5, ARRAY['CSE','ISE','AIML','DS']),
('Civil Design Engineer', 'L&T', 'Structural design and project management. AutoCAD, STAAD.Pro. 2024/2025 graduates.', 'Full-time', 'Chennai / Mumbai', ARRAY['CV','Structural','AutoCAD'], 'https://www.lntecc.com/careers', 6.0, ARRAY['CV']),
('VLSI Design Intern', 'Intel', 'RTL design and verification. Verilog/SystemVerilog. ₹50,000/month.', 'Internship', 'Bengaluru', ARRAY['ECE','VLSI','Verilog'], 'https://jobs.intel.com', 7.5, ARRAY['ECE']),
('Product Manager Intern', 'Swiggy', 'Product analytics and roadmap execution. Strong communication + data skills. ₹30,000/month.', 'Internship', 'Bengaluru', ARRAY['CSE','ISE','DS','Product'], 'https://careers.swiggy.com', 7.0, ARRAY['CSE','ISE','DS']),
('DevOps Engineer', 'Razorpay', 'CI/CD pipelines, Kubernetes, cloud infrastructure. AWS + Docker expertise.', 'Full-time', 'Bengaluru', ARRAY['CSE','ISE','DevOps','AWS'], 'https://razorpay.com/careers', 7.0, ARRAY['CSE','ISE'])
ON CONFLICT DO NOTHING;

-- ── AI Usage Logging ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_code TEXT,
    title TEXT,
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ai_usage_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage_log(user_id, feature, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON ai_chat_sessions(user_id);

-- ── Scholarships ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scholarships (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    amount TEXT,
    deadline DATE,
    min_cgpa REAL DEFAULT 0,
    eligible_branches TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'merit',
    apply_link TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO scholarships (name, provider, amount, min_cgpa, eligible_branches, category, apply_link, description) VALUES
('NSP Post-Matric Scholarship', 'National Scholarship Portal', 'Up to ₹12,000/year', 0, ARRAY[]::TEXT[], 'central-govt', 'https://scholarships.gov.in', 'For SC/ST/OBC students. Apply on NSP portal. Family income below ₹2.5 lakh.'),
('Pradhan Mantri Scholarship Scheme', 'WARB Ministry of Home Affairs', 'Up to ₹25,000/year', 0, ARRAY[]::TEXT[], 'central-govt', 'https://ksb.gov.in/pm-scholarship', 'For wards of ex-servicemen. Apply on KSB portal.'),
('Karnataka Rajyotsava Scholarship', 'Karnataka Govt - DSCE', 'Up to ₹5,000/year', 8.0, ARRAY[]::TEXT[], 'state-merit', 'https://karunadu.karnataka.gov.in', 'For students scoring 80%+ in previous exam. Kannada medium students get preference.'),
('LIC Golden Jubilee Foundation Scholarship', 'LIC of India', '₹20,000/year', 0, ARRAY[]::TEXT[], 'private', 'https://licindia.in/bottom_banner/lic-golden-jubilee-foundation', 'For students from economically weaker sections. Family income below ₹1 lakh.'),
('Google Generation Scholarship', 'Google India', 'Up to ₹75,000', 7.0, ARRAY['CSE','ISE','AIML','DS']::TEXT[], 'private-merit', 'https://buildyourfuture.withgoogle.com/scholarships', 'For female students in computer science. Strong academic record required.'),
('AICTE Pragati Scholarship', 'AICTE', '₹50,000/year', 0, ARRAY[]::TEXT[], 'central-govt', 'https://www.aicte-india.org/schemes/students-development-schemes/PG-Scholarship', 'For girl students in AICTE approved institutions. Family income below ₹8 lakh.'),
('AICTE Saksham Scholarship', 'AICTE', '₹50,000/year', 0, ARRAY[]::TEXT[], 'central-govt', 'https://www.aicte-india.org/schemes/students-development-schemes/PG-Scholarship', 'For specially-abled students in AICTE approved programs.'),
('Inspire Scholarship (DST)', 'Dept of Science & Technology', '₹80,000/year', 8.0, ARRAY[]::TEXT[], 'central-govt', 'https://online-inspire.gov.in', 'For students in the top 1% of 10+2. Strong science background required.'),
('VTU Merit Scholarship', 'VTU', '₹10,000-25,000', 8.5, ARRAY[]::TEXT[], 'state-merit', 'https://vtu.ac.in', 'For VTU students with CGPA 8.5+ in previous year. Department toppers.'),
('Infosys BPM Scholarship', 'Infosys Foundation', '₹30,000/year', 7.0, ARRAY['CSE','ISE','ECE']::TEXT[], 'corporate', 'https://www.infosys.com/infosys-foundation/initiatives/scholarships.html', 'For meritorious students from economically weaker backgrounds in engineering.')
ON CONFLICT DO NOTHING;

-- ── Interview Questions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_questions (
    id SERIAL PRIMARY KEY,
    company TEXT,
    type TEXT DEFAULT 'hr',
    difficulty TEXT DEFAULT 'medium',
    question TEXT NOT NULL,
    sample_answer TEXT,
    tips TEXT,
    tags TEXT[] DEFAULT '{}'
);

INSERT INTO interview_questions (company, type, difficulty, question, sample_answer, tips, tags) VALUES
('General', 'hr', 'easy', 'Tell me about yourself.', 'Start with your name, branch, and college. Mention 2-3 key achievements (CGPA, project, internship). End with why you are applying here.', 'Keep it to 90 seconds. Practice until it sounds natural. Do not read your resume.', ARRAY['introduction','common']),
('General', 'hr', 'easy', 'What are your strengths?', 'Choose 2-3 strengths relevant to the role. Give a specific example for each. For example: problem-solving (solved X in project), teamwork (led a team of 5).', 'Back every strength with a real example. Avoid generic answers like "hardworking".', ARRAY['strengths','self-assessment']),
('General', 'hr', 'medium', 'Where do you see yourself in 5 years?', 'I see myself growing into a senior engineer role, having delivered multiple projects and mentored junior team members. I want to develop deep expertise in [relevant domain].', 'Show ambition but keep it realistic. Align your answer with the company growth path.', ARRAY['career-goals','ambition']),
('General', 'hr', 'medium', 'Why should we hire you?', 'I bring a strong foundation in [skills], practical experience from [project/internship], and a genuine interest in [company domain]. I learn fast and I am committed to contributing from day one.', 'Research the company beforehand. Align your answer to their values and JD.', ARRAY['self-pitch','common']),
('TCS', 'hr', 'easy', 'What do you know about TCS?', 'TCS is India''s largest IT services company by revenue. It serves clients in 46 countries, has 600,000+ employees, and is known for NQT-based campus hiring with Ninja and Digital tracks.', 'Always research the company before any interview. Know their latest news and products.', ARRAY['company-knowledge','tcs']),
('TCS', 'technical', 'medium', 'What is the difference between process and thread?', 'A process is an independent program in execution with its own memory space. A thread is a lightweight sub-unit of a process that shares memory. Threads are faster to create and communicate, but processes are more isolated.', 'Draw a diagram if on whiteboard. Mention context switching cost.', ARRAY['os','concurrency','tcs']),
('Infosys', 'hr', 'easy', 'What do you know about Infosys?', 'Infosys is a global IT leader founded in 1981 in Bengaluru. Known for InfyTQ program, Lex learning platform, and large-scale digital transformation projects. Second largest IT company in India.', 'Mention InfyTQ since you likely came through that channel.', ARRAY['company-knowledge','infosys']),
('General', 'technical', 'medium', 'Explain OOPS concepts with an example.', 'OOPS has 4 pillars: Encapsulation (hiding data inside class), Inheritance (child class gets parent properties), Polymorphism (same method behaves differently), Abstraction (showing only what is needed). Example: Car class inherits Vehicle.', 'Use a real-world analogy. The Car/Vehicle example is classic and effective.', ARRAY['oops','java','fundamentals']),
('General', 'technical', 'hard', 'What is a deadlock and how do you prevent it?', 'Deadlock occurs when 2+ processes wait for each other''s resources. Four conditions: Mutual exclusion, Hold and wait, No preemption, Circular wait. Prevention: avoid circular wait using resource ordering, use timeout.', 'Draw the circular wait diagram. Mention banker''s algorithm for detection.', ARRAY['os','deadlock','concurrency']),
('Wipro', 'hr', 'medium', 'Describe a challenging situation and how you handled it.', 'Use STAR format: Situation (project deadline with team conflict), Task (I was leading the module), Action (I held a daily standup and redistributed work), Result (delivered on time with 90% test coverage).', 'STAR = Situation, Task, Action, Result. Always end with a positive outcome and learning.', ARRAY['behavioral','situation','wipro'])
ON CONFLICT DO NOTHING;
