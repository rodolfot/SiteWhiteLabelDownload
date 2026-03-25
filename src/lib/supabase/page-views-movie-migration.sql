-- Add movie_id column to page_views — same pattern as series_id
ALTER TABLE page_views
  ADD COLUMN IF NOT EXISTS movie_id UUID REFERENCES movies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_page_views_movie ON page_views (movie_id, created_at DESC);
