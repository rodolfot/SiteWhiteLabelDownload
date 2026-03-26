-- Books table — follows movies pattern
CREATE TABLE IF NOT EXISTS books (
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
  author VARCHAR(255),
  pages INTEGER,
  publisher VARCHAR(255),
  isbn VARCHAR(20),
  format VARCHAR(20) DEFAULT 'PDF',
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
CREATE INDEX IF NOT EXISTS idx_books_slug ON books (slug);
CREATE INDEX IF NOT EXISTS idx_books_featured ON books (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_books_category ON books USING GIN (category);
CREATE INDEX IF NOT EXISTS idx_books_title_en_null ON books (id) WHERE title_en IS NULL;

-- RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "books_public_read" ON books
  FOR SELECT USING (true);

-- Admin write
CREATE POLICY "books_admin_write" ON books
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Revoke direct anon writes
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON books FROM anon;

-- Updated_at trigger
DROP TRIGGER IF EXISTS books_set_updated_at ON books;
CREATE TRIGGER books_set_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
