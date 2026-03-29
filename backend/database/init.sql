-- ============================================================
-- Campus Connect — Full Database Schema
-- VTU Student Portal
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    semester TEXT,
    college TEXT,
    mobile TEXT CHECK (length(mobile) <= 15),
    branch TEXT,
    year_scheme TEXT,
    sgpa REAL DEFAULT 0,
    cgpa REAL DEFAULT 0,
    otp TEXT,
    otp_expiry TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    profile_bio TEXT,
    profile_avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marks per subject per semester
CREATE TABLE IF NOT EXISTS marks (
    mark_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_code TEXT NOT NULL,
    subject_name TEXT,
    internal_marks INTEGER DEFAULT 0,
    external_marks INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    grade_points REAL DEFAULT 0,
    credits INTEGER DEFAULT 4,
    semester TEXT,
    is_failed BOOLEAN GENERATED ALWAYS AS (total < 40) STORED,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, subject_code)
);

-- SGPA history per semester
CREATE TABLE IF NOT EXISTS sgpa_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    semester TEXT NOT NULL,
    sgpa REAL NOT NULL,
    credits INTEGER DEFAULT 0,
    uploaded_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marks card uploads
CREATE TABLE IF NOT EXISTS marks_cards (
    card_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    file_id TEXT,
    semester TEXT,
    uploaded_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    time_str TEXT NOT NULL,
    message TEXT NOT NULL,
    is_done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shared documents
CREATE TABLE IF NOT EXISTS shared_documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    file_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    description TEXT,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training courses (online training / backlog clearing)
CREATE TABLE IF NOT EXISTS training_courses (
    course_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'backlog_clearing' | 'upskill' | 'placement'
    subject_code TEXT, -- linked VTU subject code if backlog clearing
    department TEXT,
    semester TEXT,
    year_scheme TEXT,
    instructor TEXT,
    duration_hours INTEGER DEFAULT 0,
    video_url TEXT,
    thumbnail_url TEXT,
    is_free BOOLEAN DEFAULT TRUE,
    has_certificate BOOLEAN DEFAULT TRUE,
    modules JSONB,           -- array of {title, lessons:[{title,duration,type}]}
    course_url TEXT,         -- external course link (YouTube playlist / Coursera etc.)
    what_you_learn TEXT[],   -- bullet points of learning outcomes
    requirements TEXT[],     -- prerequisites
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User course enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES training_courses(course_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0,       -- 0-100
    completed_at TIMESTAMP,
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_id TEXT,     -- unique certificate ID e.g. CC-2024-ABC123
    UNIQUE (user_id, course_id)
);

-- VTU Resources (notes, question papers, syllabus etc.)
CREATE TABLE IF NOT EXISTS vtu_resources (
    resource_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'notes' | 'question_paper' | 'syllabus' | 'video_lecture'
    subject_code TEXT,
    subject_name TEXT NOT NULL,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
    year_scheme TEXT NOT NULL,   -- '2021' | '2018' | '2015'
    file_url TEXT NOT NULL,
    file_data TEXT,   -- base64 or path for admin-uploaded files
    source TEXT DEFAULT 'VTU Official',
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed: Sample training courses
INSERT INTO training_courses (title, description, category, subject_code, department, semester, year_scheme, instructor, duration_hours, is_free, has_certificate)
VALUES
  ('Mathematics Backlog Clearing — 21MAT11', 'Covers all 21MAT11 VTU exam topics with practice problems, previous year papers, and concept videos.', 'backlog_clearing', '21MAT11', 'ALL', '1', '2021', 'Dr. Ramesh Kumar', 20, true, true),
  ('Engineering Physics — Complete Revision', 'Full 21PHY12 syllabus revision for backlog students with exam strategies.', 'backlog_clearing', '21PHY12', 'ALL', '1', '2021', 'Prof. Anita Sharma', 18, true, true),
  ('DBMS Backlog Clearing', 'Covers all DBMS concepts — ER diagrams, normalization, SQL, transactions.', 'backlog_clearing', '21CS32', 'CSE', '3', '2021', 'Mr. Suresh Pai', 25, true, true),
  ('Data Structures — Zero to Hero', 'Arrays, linked lists, trees, graphs, sorting — complete DSA for VTU.', 'upskill', NULL, 'CSE', '3', '2021', 'Ms. Priya Nair', 30, true, true),
  ('Python for Placements', 'Python programming, OOP, file handling, libraries — placement-ready.', 'placement', NULL, 'ALL', NULL, NULL, 'Mr. Arjun Rao', 40, true, true),
  ('Full Stack Web Development', 'HTML, CSS, JS, React, Node.js — build a complete web application.', 'upskill', NULL, 'CSE', NULL, NULL, 'Ms. Kavya Reddy', 60, false, true),
  ('Machine Learning Fundamentals', 'Supervised and unsupervised learning, sklearn, real-world projects.', 'upskill', NULL, 'CSE', NULL, NULL, 'Dr. Vijay Menon', 45, false, true),
  ('Aptitude & Reasoning for Placements', 'Quantitative aptitude, logical reasoning, verbal ability — crack any placement test.', 'placement', NULL, 'ALL', NULL, NULL, 'Mr. Ravi Shankar', 35, true, true)
ON CONFLICT DO NOTHING;

-- Seed: Sample VTU Resources (2021 scheme CSE Sem 3)
INSERT INTO vtu_resources (title, resource_type, subject_code, subject_name, department, semester, year_scheme, file_url, source)
VALUES
  -- ══ CSE 2021 Scheme — Sem 1 ═══════════════════════════════════════════════
  ('21MAT11 Engineering Mathematics I — Full Notes', 'notes', '21MAT11', 'Engineering Mathematics I', 'ALL', 1, '2021', 'https://vtupulse.com/engineering-mathematics-1/', 'VTU Pulse'),
  ('21PHY12 Engineering Physics — Module-wise Notes', 'notes', '21PHY12', 'Engineering Physics', 'ALL', 1, '2021', 'https://vtupulse.com/engineering-physics/', 'VTU Pulse'),
  ('21ELN15 Basic Electronics — Full Notes', 'notes', '21ELN15', 'Basic Electronics Engineering', 'ALL', 1, '2021', 'https://vtupulse.com/basic-electronics/', 'VTU Pulse'),
  ('21MAT11 Engineering Maths I PYQ 2022-2024', 'question_paper', '21MAT11', 'Engineering Mathematics I', 'ALL', 1, '2021', 'https://vtu.ac.in/pdf/qp/2023/21mat11.pdf', 'VTU Official'),
  ('VTU 2021 Scheme Sem 1 All Syllabi', 'syllabus', NULL, 'First Semester 2021 Scheme', 'ALL', 1, '2021', 'https://vtu.ac.in/pdf/cbcs/pgsyllabus/2021/common/sem1.pdf', 'VTU Official'),

  -- ══ CSE 2021 Scheme — Sem 3 ═══════════════════════════════════════════════
  ('21CS31 Data Structures — Complete Notes', 'notes', '21CS31', 'Data Structures and Applications', 'CSE', 3, '2021', 'https://www.vtupdfs.com/wp-content/uploads/2022/06/21CS31.pdf', 'VTU PDFs'),
  ('21CS31 DSA Previous Year Papers 2022-2024', 'question_paper', '21CS31', 'Data Structures and Applications', 'CSE', 3, '2021', 'https://vtu.ac.in/pdf/qp/2023/21cs31.pdf', 'VTU Official'),
  ('21CS32 Design & Analysis of Algorithms Notes', 'notes', '21CS32', 'Design and Analysis of Algorithms', 'CSE', 3, '2021', 'https://www.vtupdfs.com/wp-content/uploads/2022/07/21CS32.pdf', 'VTU PDFs'),
  ('21CS32 DAA Question Papers 2022-2023', 'question_paper', '21CS32', 'Design and Analysis of Algorithms', 'CSE', 3, '2021', 'https://vtu.ac.in/pdf/qp/2023/21cs32.pdf', 'VTU Official'),
  ('21MAT31 Transform Calculus Notes (All Modules)', 'notes', '21MAT31', 'Transform Calculus Fourier Series and Numerical Techniques', 'CSE', 3, '2021', 'https://www.vtupdfs.com/wp-content/uploads/2022/06/21MAT31.pdf', 'VTU PDFs'),
  ('21CS33 Computer Organization Notes', 'notes', '21CS33', 'Computer Organization', 'CSE', 3, '2021', 'https://vtupulse.com/computer-organization/', 'VTU Pulse'),
  ('21CS34 Microcontrollers and Embedded Systems Notes', 'notes', '21CS34', 'Microcontrollers and Embedded Systems', 'CSE', 3, '2021', 'https://www.vtupdfs.com/wp-content/uploads/2022/07/21CS34.pdf', 'VTU PDFs'),

  -- ══ CSE 2021 Scheme — Sem 4 ═══════════════════════════════════════════════
  ('21CS41 Software Engineering — Complete Notes', 'notes', '21CS41', 'Software Engineering', 'CSE', 4, '2021', 'https://vtupulse.com/software-engineering-21cs41/', 'VTU Pulse'),
  ('21CS42 Analysis and Design of Algorithms Notes', 'notes', '21CS42', 'Analysis and Design of Algorithms', 'CSE', 4, '2021', 'https://www.vtupdfs.com/wp-content/uploads/2022/08/21CS42.pdf', 'VTU PDFs'),
  ('21CS43 Operating Systems Notes', 'notes', '21CS43', 'Operating Systems', 'CSE', 4, '2021', 'https://vtupulse.com/operating-systems-21cs43/', 'VTU Pulse'),
  ('21CS44 Automata Theory and Computability', 'notes', '21CS44', 'Automata Theory and Computability', 'CSE', 4, '2021', 'https://www.vtupdfs.com/wp-content/uploads/2022/08/21CS44.pdf', 'VTU PDFs'),
  ('21MAT41 Complex Analysis, Probability and Statistics', 'notes', '21MAT41', 'Complex Analysis Probability and Statistics', 'CSE', 4, '2021', 'https://www.vtupdfs.com/wp-content/uploads/2022/08/21MAT41.pdf', 'VTU PDFs'),

  -- ══ CSE 2021 Scheme — Sem 5 ═══════════════════════════════════════════════
  ('21CS51 Computer Networks Notes', 'notes', '21CS51', 'Computer Networks', 'CSE', 5, '2021', 'https://vtupulse.com/computer-networks-21cs51/', 'VTU Pulse'),
  ('21CS52 Artificial Intelligence Notes', 'notes', '21CS52', 'Artificial Intelligence', 'CSE', 5, '2021', 'https://www.vtupdfs.com/wp-content/uploads/2022/09/21CS52.pdf', 'VTU PDFs'),
  ('21CS53 Database Management Systems Notes', 'notes', '21CS53', 'Database Management Systems', 'CSE', 5, '2021', 'https://vtupulse.com/database-management-systems-21cs53/', 'VTU Pulse'),

  -- ══ ECE 2021 Scheme ════════════════════════════════════════════════════════
  ('21EC31 Network Analysis — Complete Notes', 'notes', '21EC31', 'Network Analysis', 'ECE', 3, '2021', 'https://vtupulse.com/network-analysis-21ec31/', 'VTU Pulse'),
  ('21EC32 Electronic Devices and Circuits Notes', 'notes', '21EC32', 'Electronic Devices and Circuits', 'ECE', 3, '2021', 'https://www.vtupdfs.com/wp-content/uploads/2022/07/21EC32.pdf', 'VTU PDFs'),
  ('21EC41 Signals and Systems Notes', 'notes', '21EC41', 'Signals and Systems', 'ECE', 4, '2021', 'https://vtupulse.com/signals-and-systems-21ec41/', 'VTU Pulse'),
  ('21EC42 Electromagnetic Waves Notes', 'notes', '21EC42', 'Electromagnetic Waves', 'ECE', 4, '2021', 'https://www.vtupdfs.com/wp-content/uploads/2022/08/21EC42.pdf', 'VTU PDFs'),
  ('21EC44 Analog Circuits Notes', 'notes', '21EC44', 'Analog Circuits', 'ECE', 4, '2021', 'https://vtupulse.com/analog-circuits-21ec44/', 'VTU Pulse'),

  -- ══ ME 2021 Scheme ═════════════════════════════════════════════════════════
  ('21ME31 Mechanics of Materials Notes', 'notes', '21ME31', 'Mechanics of Materials', 'ME', 3, '2021', 'https://vtupulse.com/mechanics-of-materials-21me31/', 'VTU Pulse'),
  ('21ME32 Engineering Thermodynamics Notes', 'notes', '21ME32', 'Engineering Thermodynamics', 'ME', 3, '2021', 'https://www.vtupdfs.com/wp-content/uploads/2022/07/21ME32.pdf', 'VTU PDFs'),
  ('21ME41 Kinematics of Machines Notes', 'notes', '21ME41', 'Kinematics of Machines', 'ME', 4, '2021', 'https://vtupulse.com/kinematics-of-machines-21me41/', 'VTU Pulse'),
  ('21ME42 Fluid Mechanics Notes', 'notes', '21ME42', 'Fluid Mechanics', 'ME', 4, '2021', 'https://www.vtupdfs.com/wp-content/uploads/2022/08/21ME42.pdf', 'VTU PDFs'),

  -- ══ 2018 Scheme Resources ══════════════════════════════════════════════════
  ('18CS42 Design and Analysis of Algorithms — 2018', 'notes', '18CS42', 'Design and Analysis of Algorithms', 'CSE', 4, '2018', 'https://vtupulse.com/daa-18cs42/', 'VTU Pulse'),
  ('18CS43 Operating Systems — 2018 Scheme Notes', 'notes', '18CS43', 'Operating Systems', 'CSE', 4, '2018', 'https://vtupulse.com/os-18cs43/', 'VTU Pulse'),
  ('18CS44 Microprocessors — 2018 Notes', 'notes', '18CS44', 'Microprocessors', 'CSE', 4, '2018', 'https://vtupulse.com/microprocessors-18cs44/', 'VTU Pulse'),
  ('18CS52 Computer Networks — 2018 Scheme', 'notes', '18CS52', 'Computer Networks', 'CSE', 5, '2018', 'https://vtupulse.com/computer-networks-18cs52/', 'VTU Pulse'),
  ('18CS53 Database Management Systems — 2018', 'notes', '18CS53', 'DBMS', 'CSE', 5, '2018', 'https://vtupulse.com/dbms-18cs53/', 'VTU Pulse'),
  ('18CS54 Automata Theory — 2018 Scheme', 'notes', '18CS54', 'Automata Theory', 'CSE', 5, '2018', 'https://vtupulse.com/automata-18cs54/', 'VTU Pulse'),
  ('18EC51 Signals and Systems — 2018 Scheme Notes', 'notes', '18EC51', 'Signals and Systems', 'ECE', 5, '2018', 'https://vtupulse.com/signals-systems-18ec51/', 'VTU Pulse'),
  ('18ME51 Turbo Machines — 2018 Notes', 'notes', '18ME51', 'Turbo Machines', 'ME', 5, '2018', 'https://vtupulse.com/turbo-machines-18me51/', 'VTU Pulse'),

  -- ══ Official Syllabus PDFs ═════════════════════════════════════════════════
  ('VTU 2021 Scheme CSE Full Syllabus', 'syllabus', NULL, 'CSE B.E. 2021 Scheme', 'CSE', 1, '2021', 'https://vtu.ac.in/pdf/cbcs/pgsyllabus/2021/csit/scheme.pdf', 'VTU Official'),
  ('VTU 2021 Scheme ECE Full Syllabus', 'syllabus', NULL, 'ECE B.E. 2021 Scheme', 'ECE', 1, '2021', 'https://vtu.ac.in/pdf/cbcs/pgsyllabus/2021/ece/scheme.pdf', 'VTU Official'),
  ('VTU 2021 Scheme ME Full Syllabus', 'syllabus', NULL, 'ME B.E. 2021 Scheme', 'ME', 1, '2021', 'https://vtu.ac.in/pdf/cbcs/pgsyllabus/2021/me/scheme.pdf', 'VTU Official'),
  ('VTU 2018 Scheme CSE Syllabus', 'syllabus', NULL, 'CSE B.E. 2018 Scheme', 'CSE', 1, '2018', 'https://vtu.ac.in/pdf/cbcs/pgsyllabus/2018/csit/scheme.pdf', 'VTU Official'),
  ('VTU Results Portal — Official', 'question_paper', NULL, 'VTU Official Results', 'ALL', 1, '2021', 'https://results.vtu.ac.in', 'VTU Official'),
  ('VTU e-Learning Video Lectures', 'video_lecture', NULL, 'VTU e-Learning Portal', 'ALL', 1, '2021', 'https://elearning.vtu.ac.in', 'VTU Official'),
  ('NPTEL Lectures — Engineering Mathematics', 'video_lecture', NULL, 'NPTEL Mathematics', 'ALL', 1, '2021', 'https://nptel.ac.in/courses/111107105', 'NPTEL'),
  ('NPTEL Computer Networks Lectures', 'video_lecture', '21CS51', 'Computer Networks', 'CSE', 5, '2021', 'https://nptel.ac.in/courses/106/105/106105183/', 'NPTEL')

ON CONFLICT DO NOTHING;

-- ============================================================
-- PHASE 2 — New Feature Tables
-- ============================================================

-- Attendance tracking
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_code TEXT NOT NULL,
    subject_name TEXT,
    total_classes INTEGER DEFAULT 0,
    attended_classes INTEGER DEFAULT 0,
    percentage REAL GENERATED ALWAYS AS (
        CASE WHEN total_classes > 0 THEN (attended_classes::REAL / total_classes) * 100 ELSE 0 END
    ) STORED,
    semester TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, subject_code)
);

-- Exam timetable
CREATE TABLE IF NOT EXISTS exam_timetable (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_code TEXT,
    subject_name TEXT NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TEXT DEFAULT '10:00 AM',
    venue TEXT,
    semester TEXT,
    year_scheme TEXT,
    source TEXT DEFAULT 'manual', -- 'vtu_official' | 'manual'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Placement drives
CREATE TABLE IF NOT EXISTS placement_drives (
    drive_id SERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL,
    package_lpa REAL,
    package_max_lpa REAL,
    drive_date DATE,
    registration_deadline DATE,
    eligible_branches TEXT[],  -- ['CSE','ISE','ECE']
    min_cgpa REAL DEFAULT 6.0,
    eligible_backlogs INTEGER DEFAULT 0,
    description TEXT,
    apply_link TEXT,
    company_logo TEXT,
    location TEXT,
    drive_type TEXT DEFAULT 'campus', -- 'campus' | 'off_campus' | 'pool'
    status TEXT DEFAULT 'upcoming',   -- 'upcoming' | 'open' | 'closed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student placement applications
CREATE TABLE IF NOT EXISTS placement_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    drive_id INTEGER REFERENCES placement_drives(drive_id) ON DELETE CASCADE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'applied', -- 'applied' | 'shortlisted' | 'rejected' | 'placed'
    UNIQUE(user_id, drive_id)
);

-- Community notes & PYQ sharing
CREATE TABLE IF NOT EXISTS community_resources (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL, -- 'notes' | 'pyq' | 'assignment' | 'other'
    subject_code TEXT,
    subject_name TEXT,
    department TEXT,
    semester INTEGER,
    year_scheme TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT,
    rating_avg REAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT TRUE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community resource ratings
CREATE TABLE IF NOT EXISTS community_ratings (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES community_resources(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource_id, user_id)
);

-- Alumni mentorship
CREATE TABLE IF NOT EXISTS alumni (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    branch TEXT NOT NULL,
    graduation_year INTEGER NOT NULL,
    current_company TEXT,
    current_role TEXT,
    linkedin_url TEXT,
    bio TEXT,
    skills TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    college TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentorship requests
CREATE TABLE IF NOT EXISTS mentorship_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    alumni_id INTEGER REFERENCES alumni(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, alumni_id)
);

-- Revaluation requests
CREATE TABLE IF NOT EXISTS revaluation_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_code TEXT NOT NULL,
    subject_name TEXT,
    semester TEXT,
    usn TEXT,
    reason TEXT,
    status TEXT DEFAULT 'draft', -- 'draft' | 'submitted'
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mock tests
CREATE TABLE IF NOT EXISTS mock_tests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_code TEXT,
    subject_name TEXT,
    questions JSONB,  -- array of {question, options, answer, explanation}
    score INTEGER,
    total_questions INTEGER,
    time_taken_seconds INTEGER,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed: Sample placement drives
INSERT INTO placement_drives (company_name, role, package_lpa, package_max_lpa, drive_date, registration_deadline, eligible_branches, min_cgpa, eligible_backlogs, description, apply_link, drive_type, status)
VALUES
  ('Infosys', 'Systems Engineer', 4.5, 5.0, CURRENT_DATE + 10, CURRENT_DATE + 5, ARRAY['CSE','ISE','ECE','EEE','ME','CV'], 6.0, 0, 'Infosys Systems Engineer role — 6 month training in Mysuru followed by project allocation. Open to 2024/2025 graduates.', 'https://www.infosys.com/careers/apply-jobs.html', 'campus', 'upcoming'),
  ('Wipro', 'Project Engineer', 3.5, 4.0, CURRENT_DATE + 15, CURRENT_DATE + 8, ARRAY['CSE','ISE','ECE','EEE'], 6.5, 0, 'Wipro turbo / elite program for top performers. Strong aptitude and coding skills required.', 'https://careers.wipro.com', 'campus', 'upcoming'),
  ('TCS', 'Digital / Ninja', 3.6, 7.0, CURRENT_DATE + 7, CURRENT_DATE + 3, ARRAY['CSE','ISE','ECE','ME','CV','EEE'], 6.0, 0, 'TCS NQT — two tracks: Ninja (3.6 LPA) and Digital (7 LPA). Register at TCS iON portal.', 'https://tcsion.com', 'campus', 'open'),
  ('Accenture', 'Associate Software Engineer', 4.5, 6.5, CURRENT_DATE + 20, CURRENT_DATE + 14, ARRAY['CSE','ISE','ECE'], 6.0, 0, 'Accenture ASE/SE roles. Communication, coding, and aptitude round.', 'https://www.accenture.com/in-en/careers/jobsearch?jk=entry+level+technology', 'off_campus', 'upcoming'),
  ('Capgemini', 'Analyst', 4.0, 5.5, CURRENT_DATE + 25, CURRENT_DATE + 18, ARRAY['CSE','ISE','ECE','EEE'], 6.0, 0, 'Capgemini SuperCoders track for high performers.', 'https://capgemini.com/careers', 'pool', 'upcoming')
ON CONFLICT DO NOTHING;

-- Seed: Sample alumni
INSERT INTO alumni (full_name, email, branch, graduation_year, current_company, current_role, linkedin_url, bio, skills, is_available)
VALUES
  ('Rahul Sharma', 'rahul.sharma@alumni.com', 'CSE', 2022, 'Google', 'Software Engineer', 'https://linkedin.com/in/rahulsharma', 'VTU CSE 2022. Currently at Google Hyderabad. Happy to mentor juniors on DSA, system design, and FAANG prep.', ARRAY['DSA','System Design','Python','Java'], true),
  ('Priya Nair', 'priya.nair@alumni.com', 'CSE', 2021, 'Microsoft', 'SDE-1', 'https://linkedin.com/in/priyanair', 'VTU CSE 2021 gold medalist. At Microsoft Bangalore. Can guide on campus placements and competitive programming.', ARRAY['C++','LeetCode','Azure','React'], true),
  ('Arjun Reddy', 'arjun.reddy@alumni.com', 'ECE', 2023, 'Qualcomm', 'Associate Engineer', 'https://linkedin.com/in/arjunreddy', 'ECE batch 2023. Core electronics role at Qualcomm. Can help with embedded, VLSI, and ECE placements.', ARRAY['Embedded C','VLSI','ARM','Python'], true),
  ('Sneha Kulkarni', 'sneha.k@alumni.com', 'ISE', 2022, 'Flipkart', 'Backend Developer', 'https://linkedin.com/in/snehak', 'ISE 2022. At Flipkart Bangalore. Strong in backend development and system design.', ARRAY['Java','Spring Boot','Microservices','SQL'], true),
  ('Vikram Patel', 'vikram.p@alumni.com', 'ME', 2021, 'Bosch', 'Design Engineer', 'https://linkedin.com/in/vikramp', 'ME 2021. At Bosch. Can guide core ME students on placements and higher studies.', ARRAY['CAD','Ansys','MATLAB','C'], true)
ON CONFLICT DO NOTHING;

-- ── Password Reset Tokens ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL,          -- placement, backlog, attendance, announcement, marks
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);

-- ── VTU Results Cache (direct result checker) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS vtu_results_cache (
    id SERIAL PRIMARY KEY,
    usn TEXT NOT NULL,
    result_json JSONB NOT NULL,
    semester TEXT,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vtu_cache_usn ON vtu_results_cache(usn);

-- ── Study Planner ─────────────────────────────────────────────────────────────
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

-- ── Coding Platform ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coding_problems (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
    difficulty_order INTEGER DEFAULT 2,
    tags TEXT[] DEFAULT '{}',
    constraints TEXT,
    hints JSONB DEFAULT '[]',
    starter_code JSONB DEFAULT '{}',  -- {python: '...', java: '...', c: '...', csharp: '...'}
    test_cases JSONB DEFAULT '[]',    -- [{input:'...', expected_output:'...', hidden:false}]
    examples JSONB DEFAULT '[]',      -- [{input:'...', output:'...', explanation:'...'}]
    companies TEXT[] DEFAULT '{}',
    acceptance_rate REAL DEFAULT 0,
    created_by_admin BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
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
    status TEXT DEFAULT 'pending',  -- accepted, wrong_answer, runtime_error, time_limit
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

-- Seed sample problems

-- Seed coding problems is handled by migration_v2_seeds.sql
-- (Moved to avoid SQL string escaping complexity)
