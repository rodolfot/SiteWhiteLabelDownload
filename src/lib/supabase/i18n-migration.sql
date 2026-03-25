-- i18n: add translation columns
-- Run this once in the Supabase SQL Editor

ALTER TABLE series
  ADD COLUMN IF NOT EXISTS title_en    VARCHAR(255),
  ADD COLUMN IF NOT EXISTS title_es    VARCHAR(255),
  ADD COLUMN IF NOT EXISTS synopsis_en TEXT,
  ADD COLUMN IF NOT EXISTS synopsis_es TEXT;

ALTER TABLE seasons
  ADD COLUMN IF NOT EXISTS title_en    VARCHAR(255),
  ADD COLUMN IF NOT EXISTS title_es    VARCHAR(255);

ALTER TABLE episodes
  ADD COLUMN IF NOT EXISTS title_en    VARCHAR(255),
  ADD COLUMN IF NOT EXISTS title_es    VARCHAR(255);

-- Indexes for filtering untranslated rows
CREATE INDEX IF NOT EXISTS idx_series_title_en_null  ON series  (id) WHERE title_en IS NULL;
CREATE INDEX IF NOT EXISTS idx_seasons_title_en_null ON seasons (id) WHERE title_en IS NULL;
CREATE INDEX IF NOT EXISTS idx_episodes_title_en_null ON episodes (id) WHERE title_en IS NULL;
