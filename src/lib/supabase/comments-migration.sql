-- Tabela de comentarios por serie
-- Executar no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  nickname VARCHAR(50) NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index para busca por serie (mais recentes primeiro)
CREATE INDEX IF NOT EXISTS idx_comments_series_id ON comments (series_id, created_at DESC);

-- RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler comentarios aprovados
CREATE POLICY "Public read approved comments" ON comments
  FOR SELECT USING (approved = true);

-- Qualquer pessoa pode inserir comentarios (anonimo)
CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Admin pode ler todos (incluindo nao aprovados)
CREATE POLICY "Admin can read all comments" ON comments
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Admin pode atualizar (aprovar/reprovar)
CREATE POLICY "Admin can update comments" ON comments
  FOR UPDATE TO authenticated
  USING (public.is_admin());

-- Admin pode deletar
CREATE POLICY "Admin can delete comments" ON comments
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Revogar escrita do anon (defense-in-depth nao se aplica aqui pois anon precisa inserir)

-- ============================================================
-- Tabela de requisicoes de series
-- ============================================================
CREATE TABLE IF NOT EXISTS series_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  nickname VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  votes INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index para busca por status e votos
CREATE INDEX IF NOT EXISTS idx_requests_status ON series_requests (status, votes DESC);
CREATE INDEX IF NOT EXISTS idx_requests_created ON series_requests (created_at DESC);

-- RLS
ALTER TABLE series_requests ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler requisicoes
CREATE POLICY "Public read requests" ON series_requests
  FOR SELECT USING (true);

-- Qualquer pessoa pode inserir requisicoes
CREATE POLICY "Anyone can insert requests" ON series_requests
  FOR INSERT WITH CHECK (true);

-- Qualquer pessoa pode votar (update apenas no campo votes)
CREATE POLICY "Anyone can vote on requests" ON series_requests
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Admin pode gerenciar
CREATE POLICY "Admin can manage requests" ON series_requests
  FOR ALL TO authenticated
  USING (public.is_admin());

-- ============================================================
-- Tabela de page views para analytics interno
-- ============================================================
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  series_id UUID REFERENCES series(id) ON DELETE SET NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index para analytics por dia
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_series ON page_views (series_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (page_path, created_at DESC);

-- RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (tracking anonimo)
CREATE POLICY "Anyone can insert page views" ON page_views
  FOR INSERT WITH CHECK (true);

-- Apenas admin pode ler
CREATE POLICY "Admin can read page views" ON page_views
  FOR SELECT TO authenticated
  USING (public.is_admin());
