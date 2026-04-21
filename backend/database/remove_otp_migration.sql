-- ============================================================
-- Migration: OTP re-enabled (email verification restored)
-- This migration ensures existing users are not locked out
-- and the OTP columns exist for new registrations.
-- Safe to run multiple times.
-- ============================================================

-- 1. Ensure OTP columns exist (in case they were dropped)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='otp') THEN
    ALTER TABLE users ADD COLUMN otp TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='otp_expiry') THEN
    ALTER TABLE users ADD COLUMN otp_expiry TIMESTAMP;
  END IF;
END $$;

-- 2. All EXISTING users stay verified (don't lock out current users)
UPDATE users SET is_verified = true WHERE is_verified = false OR is_verified IS NULL;

-- 3. is_verified defaults to false for NEW registrations (OTP required)
--    Existing users are already verified above so this only affects new rows
ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT false;

-- 4. Clean up stale OTP data and expired tokens
UPDATE users SET otp = NULL, otp_expiry = NULL
  WHERE otp_expiry IS NOT NULL AND otp_expiry < NOW() - INTERVAL '1 day';

DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '7 days';
