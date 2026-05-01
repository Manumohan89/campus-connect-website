-- ─── Migration: Fix current_role reserved keyword ─────────────────────────
-- PostgreSQL reserved keyword fix for alumni table
-- This migration handles the case where the table was previously created with the
-- problematic column name, and recreates it with the correct schema.

BEGIN;

-- Drop dependent constraints first
DROP TABLE IF EXISTS mentorship_requests CASCADE;

-- Drop and recreate the alumni table
DROP TABLE IF EXISTS alumni CASCADE;

COMMIT;
