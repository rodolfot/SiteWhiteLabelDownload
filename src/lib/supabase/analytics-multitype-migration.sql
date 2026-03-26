-- Migration: Add book_id, game_id to page_views + download_clicks table
-- Run this in Supabase SQL Editor

-- Add new columns to page_views
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES books(id) ON DELETE SET NULL;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS game_id UUID REFERENCES games(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_page_views_book_id ON page_views(book_id);
CREATE INDEX IF NOT EXISTS idx_page_views_game_id ON page_views(game_id);

-- Create download_clicks table for tracking download button clicks
CREATE TABLE IF NOT EXISTS download_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('series', 'movie', 'book', 'game')),
  content_id UUID NOT NULL,
  download_url TEXT,
  quality TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE download_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (tracking)
CREATE POLICY "Allow public insert download_clicks" ON download_clicks
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow admin reads
CREATE POLICY "Allow admin read download_clicks" ON download_clicks
  FOR SELECT TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_download_clicks_content ON download_clicks(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_download_clicks_created ON download_clicks(created_at);
