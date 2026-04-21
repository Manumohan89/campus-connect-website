-- Earn Platform Tables

ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00;

CREATE TABLE IF NOT EXISTS earn_tasks (
  id            SERIAL PRIMARY KEY,
  type          VARCHAR(20) NOT NULL CHECK (type IN ('voice','image','text')),
  title         VARCHAR(255) NOT NULL,
  instructions  TEXT,
  prompt        TEXT,
  question      TEXT,
  options       TEXT[],
  reward        DECIMAL(8,2) DEFAULT 2.00,
  estimated_time VARCHAR(50),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS earn_submissions (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  task_id       INTEGER,
  task_type     VARCHAR(20) NOT NULL,
  data_url      TEXT,
  label         TEXT,
  reward        DECIMAL(8,2) DEFAULT 2.00,
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  submitted_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS earn_withdrawals (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  amount        DECIMAL(10,2) NOT NULL,
  upi_id        VARCHAR(255),
  status        VARCHAR(20) DEFAULT 'pending',
  requested_at  TIMESTAMPTZ DEFAULT NOW(),
  processed_at  TIMESTAMPTZ
);

-- Seed demo tasks
INSERT INTO earn_tasks (type, title, instructions, prompt, reward, estimated_time) VALUES
  ('voice', 'Read a sentence aloud', 'Read the sentence clearly and at a natural pace', 'The quick brown fox jumps over the lazy dog.', 5.00, '30 sec'),
  ('voice', 'Count from 1 to 10', 'Count aloud slowly and clearly', 'Please count from one to ten.', 5.00, '20 sec'),
  ('text', 'Sentiment Analysis', 'Is this review positive, negative, or neutral?', 'The product quality was excellent and shipping was fast!', 2.00, '10 sec'),
  ('text', 'Classify the topic', 'Which category does this sentence belong to?', 'The stock market fell sharply today due to inflation concerns.', 2.00, '10 sec'),
  ('image', 'Label this image', 'Select what is shown in the image', NULL, 3.00, '15 sec')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_earn_submissions_user ON earn_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_earn_submissions_status ON earn_submissions(status);
