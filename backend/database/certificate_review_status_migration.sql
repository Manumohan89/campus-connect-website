-- Certificate lifecycle: pending_review -> issued/rejected
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS certificate_status TEXT NOT NULL DEFAULT 'not_requested';

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS review_remark TEXT;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL;

-- Ensure check constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'enrollments_certificate_status_check'
  ) THEN
    ALTER TABLE enrollments
    ADD CONSTRAINT enrollments_certificate_status_check
    CHECK (certificate_status IN ('not_requested', 'in_progress', 'pending_review', 'issued', 'rejected', 'not_applicable'));
  END IF;
END $$;

-- Backfill status for existing rows
UPDATE enrollments
SET certificate_status = CASE
  WHEN certificate_issued = true THEN 'issued'
  WHEN progress >= 100 THEN 'pending_review'
  WHEN progress > 0 THEN 'in_progress'
  ELSE 'not_requested'
END
WHERE certificate_status IS NULL OR certificate_status = 'not_requested';
