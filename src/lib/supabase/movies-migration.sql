-- Movies table — follows series pattern
CREATE TABLE IF NOT EXISTS movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  synopsis TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  year INTEGER,
  genre VARCHAR(255),
  rating NUMERIC(3, 1) DEFAULT 0,
  category TEXT[] DEFAULT ARRAY['Geral']::TEXT[],
  featured BOOLEAN DEFAULT false,
  duration INTEGER, -- duration in minutes
  download_url TEXT,
  file_size VARCHAR(50),
  quality VARCHAR(20) DEFAULT '1080p',
  -- i18n columns
  title_en VARCHAR(255),
  title_es VARCHAR(255),
  synopsis_en TEXT,
  synopsis_es TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_movies_slug ON movies (slug);
CREATE INDEX IF NOT EXISTS idx_movies_featured ON movies (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_movies_category ON movies USING GIN (category);
CREATE INDEX IF NOT EXISTS idx_movies_title_en_null ON movies (id) WHERE title_en IS NULL;

-- RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "movies_public_read" ON movies
  FOR SELECT USING (true);

-- Admin write: any authenticated user (admin routes are protected by middleware)
CREATE POLICY "movies_admin_write" ON movies
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Revoke direct anon writes (defense-in-depth, same as series table)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON movies FROM anon;

-- Updated_at trigger (reuse same function as series if it exists, otherwise create)
CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS movies_set_updated_at ON movies;
CREATE TRIGGER movies_set_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
