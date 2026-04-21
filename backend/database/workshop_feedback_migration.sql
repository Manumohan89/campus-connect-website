-- ============================================================
-- Workshop Feedback — PostgreSQL Migration
-- Replaces MongoDB Feedback model with PostgreSQL tables
-- ============================================================

CREATE TABLE IF NOT EXISTS workshop_feedback (
    id              SERIAL PRIMARY KEY,

    -- General Experience
    overall_rating  SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    liked_most      TEXT NOT NULL CHECK (liked_most IN ('Hands-on coding', 'Concepts', 'Interaction', 'Projects')),

    -- Technical Feedback
    react_confidence    TEXT NOT NULL CHECK (react_confidence IN ('Beginner', 'Moderate', 'Confident')),
    js_understanding    TEXT NOT NULL CHECK (js_understanding IN ('Poor', 'Average', 'Good', 'Excellent')),
    node_clarity        TEXT NOT NULL CHECK (node_clarity IN ('Poor', 'Average', 'Good', 'Excellent')),
    mongodb_confidence  TEXT NOT NULL CHECK (mongodb_confidence IN ('Not confident', 'Somewhat', 'Confident')),
    best_topic          TEXT NOT NULL CHECK (best_topic IN ('React', 'JavaScript', 'Node.js', 'MongoDB')),
    improvement_topic   TEXT NOT NULL CHECK (improvement_topic IN ('React', 'JavaScript', 'Node.js', 'MongoDB')),

    -- Faculty Ratings (knowledge, clarity, interaction each 1-5)
    mohan_knowledge     SMALLINT NOT NULL CHECK (mohan_knowledge BETWEEN 1 AND 5),
    mohan_clarity       SMALLINT NOT NULL CHECK (mohan_clarity BETWEEN 1 AND 5),
    mohan_interaction   SMALLINT NOT NULL CHECK (mohan_interaction BETWEEN 1 AND 5),

    raghav_knowledge    SMALLINT NOT NULL CHECK (raghav_knowledge BETWEEN 1 AND 5),
    raghav_clarity      SMALLINT NOT NULL CHECK (raghav_clarity BETWEEN 1 AND 5),
    raghav_interaction  SMALLINT NOT NULL CHECK (raghav_interaction BETWEEN 1 AND 5),

    manish_knowledge    SMALLINT NOT NULL CHECK (manish_knowledge BETWEEN 1 AND 5),
    manish_clarity      SMALLINT NOT NULL CHECK (manish_clarity BETWEEN 1 AND 5),
    manish_interaction  SMALLINT NOT NULL CHECK (manish_interaction BETWEEN 1 AND 5),

    -- Open-ended
    improvement     TEXT CHECK (char_length(improvement) <= 1000),
    suggestions     TEXT CHECK (char_length(suggestions) <= 1000),

    -- Final
    recommend       BOOLEAN NOT NULL,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast admin filtering
CREATE INDEX IF NOT EXISTS idx_workshop_feedback_rating    ON workshop_feedback (overall_rating);
CREATE INDEX IF NOT EXISTS idx_workshop_feedback_recommend ON workshop_feedback (recommend);
CREATE INDEX IF NOT EXISTS idx_workshop_feedback_created   ON workshop_feedback (created_at DESC);
