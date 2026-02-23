CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    semester TEXT,
    college TEXT,
    mobile TEXT CHECK (length(mobile) = 10),
    branch TEXT,
    year_scheme TEXT,
    sgpa REAL,
    cgpa REAL
);

CREATE TABLE marks (
    mark_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    subject_code TEXT,
    subject_name TEXT,
    internal_marks INTEGER,
    external_marks INTEGER,
    total INTEGER,
    sgpa REAL,
    credits INTEGER,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE marks_cards (
    card_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    file_id TEXT,
    uploaded_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
