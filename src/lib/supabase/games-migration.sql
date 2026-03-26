-- Games table — follows movies pattern
CREATE TABLE IF NOT EXISTS games (
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
  platform VARCHAR(255),
  developer VARCHAR(255),
  publisher VARCHAR(255),
  min_requirements TEXT,
  rec_requirements TEXT,
  download_url TEXT,
  file_size VARCHAR(50),
  -- i18n columns
  title_en VARCHAR(255),
  title_es VARCHAR(255),
  synopsis_en TEXT,
  synopsis_es TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_slug ON games (slug);
CREATE INDEX IF NOT EXISTS idx_games_featured ON games (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_games_category ON games USING GIN (category);
CREATE INDEX IF NOT EXISTS idx_games_title_en_null ON games (id) WHERE title_en IS NULL;

-- RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "games_public_read" ON games
  FOR SELECT USING (true);

-- Admin write
CREATE POLICY "games_admin_write" ON games
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Revoke direct anon writes
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON games FROM anon;

-- Updated_at trigger
DROP TRIGGER IF EXISTS games_set_updated_at ON games;
CREATE TRIGGER games_set_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
