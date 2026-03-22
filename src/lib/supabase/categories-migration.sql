-- ============================================================
-- Tabela categories: categorias dinâmicas gerenciadas pelo admin
-- Executar no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories (sort_order, name);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Leitura publica
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);

-- Admin escrita
CREATE POLICY "Admin manage categories" ON categories
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Garantir SELECT para anon
GRANT SELECT ON categories TO anon;

-- Seed: inserir categorias padrão (as que já existem no código)
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Ação', 'acao', 1),
  ('Aventura', 'aventura', 2),
  ('Comédia', 'comedia', 3),
  ('Drama', 'drama', 4),
  ('Ficção Científica', 'ficcao-cientifica', 5),
  ('Terror', 'terror', 6),
  ('Romance', 'romance', 7),
  ('Anime', 'anime', 8),
  ('Documentário', 'documentario', 9),
  ('Geral', 'geral', 10)
ON CONFLICT (name) DO NOTHING;
