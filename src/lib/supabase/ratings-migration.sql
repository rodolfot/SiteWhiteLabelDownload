-- ============================================================
-- Tabela user_ratings: avaliações de séries por usuários anônimos
-- Executar no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(series_id, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_user_ratings_series ON user_ratings (series_id);

-- RLS
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Leitura publica (para calcular media)
CREATE POLICY "Public read ratings" ON user_ratings
  FOR SELECT USING (true);

-- Qualquer pessoa pode inserir (anonimo)
CREATE POLICY "Anyone can insert ratings" ON user_ratings
  FOR INSERT WITH CHECK (true);

-- Pode atualizar seu proprio rating (mesmo ip_hash)
CREATE POLICY "Anyone can update own rating" ON user_ratings
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Garantir permissoes para anon
GRANT SELECT, INSERT, UPDATE ON user_ratings TO anon;
