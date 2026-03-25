-- i18n: convert series.category from single VARCHAR to TEXT[] (multi-category)
-- Run this once in the Supabase SQL Editor

ALTER TABLE series
  ALTER COLUMN category TYPE TEXT[]
  USING CASE
    WHEN category IS NULL OR category = '' THEN ARRAY['Geral']::TEXT[]
    ELSE ARRAY[category]::TEXT[]
  END;

ALTER TABLE series
  ALTER COLUMN category SET DEFAULT '{Geral}'::TEXT[];
