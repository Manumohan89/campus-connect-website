-- ============================================================
-- Fix Missing Unique Constraints for ON CONFLICT Operations
-- ============================================================
-- This migration adds missing UNIQUE constraints that are
-- required for ON CONFLICT clauses to work properly.

-- ── Fix leaderboard_cache table ──────────────────────────────
-- Check if UNIQUE constraint on user_id exists, if not add it
DO $$
BEGIN
  -- Try to add unique constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'UNIQUE' 
    AND table_name = 'leaderboard_cache' 
    AND constraint_name = 'leaderboard_cache_user_id_key'
  ) THEN
    ALTER TABLE leaderboard_cache ADD UNIQUE (user_id);
    RAISE NOTICE 'Added UNIQUE constraint on leaderboard_cache.user_id';
  END IF;
END $$;

-- ── Verify marks table constraint ────────────────────────────
-- The marks table should already have UNIQUE (user_id, subject_code)
-- This just ensures it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'UNIQUE' 
    AND table_name = 'marks' 
    AND constraint_name = 'marks_user_id_subject_code_key'
  ) THEN
    -- Remove any duplicates first
    DELETE FROM marks m1 
    WHERE EXISTS (
      SELECT 1 FROM marks m2 
      WHERE m1.user_id = m2.user_id 
      AND m1.subject_code = m2.subject_code 
      AND m1.mark_id < m2.mark_id
    );
    
    ALTER TABLE marks ADD UNIQUE (user_id, subject_code);
    RAISE NOTICE 'Added UNIQUE constraint on marks(user_id, subject_code)';
  END IF;
END $$;

-- ── Fix project_purchases table constraint ──────────────────────
-- The ON CONFLICT clause requires a UNIQUE constraint on (project_id, user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'UNIQUE' 
    AND table_name = 'project_purchases' 
    AND constraint_name = 'project_purchases_project_id_user_id_key'
  ) THEN
    -- Remove any duplicates first
    DELETE FROM project_purchases p1 
    WHERE EXISTS (
      SELECT 1 FROM project_purchases p2 
      WHERE p1.project_id = p2.project_id 
      AND p1.user_id = p2.user_id 
      AND p1.id < p2.id
    );
    
    ALTER TABLE project_purchases ADD UNIQUE (project_id, user_id);
    RAISE NOTICE 'Added UNIQUE constraint on project_purchases(project_id, user_id)';
  END IF;
END $$;

-- Verify the constraints exist
SELECT 'Constraint verification:' as status;
SELECT constraint_name, table_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name IN ('leaderboard_cache', 'marks', 'project_purchases') 
AND constraint_type = 'UNIQUE'
ORDER BY table_name;
