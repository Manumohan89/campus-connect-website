-- ============================================================
-- Fix Missing PRIMARY KEY on user_solved_problems table
-- Required for ON CONFLICT clause to work
-- ============================================================

-- Check and add PRIMARY KEY constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'PRIMARY KEY' 
    AND table_name = 'user_solved_problems'
  ) THEN
    -- First, remove any duplicate entries (keep the earliest solved_at per user+problem)
    DELETE FROM user_solved_problems usp1
    WHERE EXISTS (
      SELECT 1 FROM user_solved_problems usp2
      WHERE usp1.user_id = usp2.user_id
      AND usp1.problem_id = usp2.problem_id
      AND usp1.solved_at > usp2.solved_at
    );
    
    -- Now add the PRIMARY KEY constraint
    ALTER TABLE user_solved_problems 
    ADD PRIMARY KEY (user_id, problem_id);
    
    RAISE NOTICE 'Added PRIMARY KEY constraint on user_solved_problems(user_id, problem_id)';
  ELSE
    RAISE NOTICE 'PRIMARY KEY constraint on user_solved_problems(user_id, problem_id) already exists';
  END IF;
END $$;

-- Also ensure coding_submissions has proper structure for potential future ON CONFLICT usage
-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coding_subs_user_problem 
ON coding_submissions(user_id, problem_id, submitted_at DESC);

-- Verify the constraints
SELECT 
  constraint_name, 
  table_name, 
  constraint_type 
FROM information_schema.table_constraints 
WHERE table_name IN ('user_solved_problems', 'coding_submissions')
ORDER BY table_name, constraint_name;
