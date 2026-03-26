-- Migration: Add movie_id, book_id, game_id to comments table
-- Run this in Supabase SQL Editor

-- Add new columns (nullable)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS movie_id UUID REFERENCES movies(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES books(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS game_id UUID REFERENCES games(id) ON DELETE CASCADE;

-- Make series_id nullable (was required before)
ALTER TABLE comments ALTER COLUMN series_id DROP NOT NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_comments_movie_id ON comments(movie_id);
CREATE INDEX IF NOT EXISTS idx_comments_book_id ON comments(book_id);
CREATE INDEX IF NOT EXISTS idx_comments_game_id ON comments(game_id);

-- Update RLS policies to allow inserts with new columns
DROP POLICY IF EXISTS "Allow public insert comments" ON comments;
CREATE POLICY "Allow public insert comments" ON comments
  FOR INSERT TO anon
  WITH CHECK (
    (series_id IS NOT NULL OR movie_id IS NOT NULL OR book_id IS NOT NULL OR game_id IS NOT NULL)
    AND nickname IS NOT NULL
    AND content IS NOT NULL
    AND LENGTH(content) >= 3
    AND LENGTH(content) <= 1000
  );

-- Ensure read policy exists for approved comments
DROP POLICY IF EXISTS "Allow public read approved comments" ON comments;
CREATE POLICY "Allow public read approved comments" ON comments
  FOR SELECT TO anon
  USING (approved = true);
