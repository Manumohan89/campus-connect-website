-- ============================================================
-- Fix Missing UNIQUE Constraint on enrollments table
-- Required for ON CONFLICT clause to work
-- ============================================================

-- Check and add UNIQUE constraint on (user_id, course_id) if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'UNIQUE' 
    AND table_name = 'enrollments' 
    AND constraint_name = 'enrollments_user_id_course_id_key'
  ) THEN
    -- First, remove any duplicate enrollments (keep the earliest one per user+course)
    DELETE FROM enrollments e1
    WHERE EXISTS (
      SELECT 1 FROM enrollments e2
      WHERE e1.user_id = e2.user_id
      AND e1.course_id = e2.course_id
      AND e1.id > e2.id
    );
    
    -- Now add the UNIQUE constraint
    ALTER TABLE enrollments 
    ADD CONSTRAINT enrollments_user_id_course_id_key 
    UNIQUE (user_id, course_id);
    
    RAISE NOTICE 'Added UNIQUE constraint on enrollments(user_id, course_id)';
  ELSE
    RAISE NOTICE 'UNIQUE constraint on enrollments(user_id, course_id) already exists';
  END IF;
END $$;

-- Verify the constraint was created
SELECT 
  constraint_name, 
  table_name, 
  constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'enrollments'
ORDER BY constraint_name;
