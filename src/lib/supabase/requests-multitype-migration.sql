-- Migration: Add 'book' and 'game' to series_requests type column
-- Run this in Supabase SQL Editor

-- If there's a check constraint on the type column, drop and re-add it
DO $$
BEGIN
  -- Try to drop existing constraint (name may vary)
  ALTER TABLE series_requests DROP CONSTRAINT IF EXISTS series_requests_type_check;
  ALTER TABLE series_requests DROP CONSTRAINT IF EXISTS check_type;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add updated constraint
ALTER TABLE series_requests ADD CONSTRAINT series_requests_type_check
  CHECK (type IN ('serie', 'movie', 'book', 'game'));
