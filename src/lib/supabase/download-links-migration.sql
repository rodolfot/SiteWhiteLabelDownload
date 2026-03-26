-- Migration: Create download_links table for multiple download URLs on movies, books, games
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS download_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'book', 'game')),
  content_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  download_url TEXT NOT NULL,
  file_size TEXT DEFAULT '',
  quality TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE download_links ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Allow public read download_links" ON download_links
  FOR SELECT TO anon
  USING (true);

-- Admin full access
CREATE POLICY "Allow admin all download_links" ON download_links
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_download_links_content ON download_links(content_type, content_id);
