-- Migration script to update marks table column name
-- Run this on your PostgreSQL database

ALTER TABLE marks RENAME COLUMN sgpa TO grade_points;