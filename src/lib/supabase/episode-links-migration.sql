-- ============================================================
-- Tabela episode_links: multiplos links por episodio
-- com idioma, qualidade e tamanho independentes
--
-- Executar no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS episode_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  language VARCHAR(30) NOT NULL DEFAULT 'Dublado',
  download_url TEXT NOT NULL,
  file_size VARCHAR(50),
  quality VARCHAR(20) DEFAULT '1080p',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(episode_id, language, quality)
);

-- Index para busca por episodio
CREATE INDEX IF NOT EXISTS idx_episode_links_episode_id ON episode_links (episode_id);

-- RLS
ALTER TABLE episode_links ENABLE ROW LEVEL SECURITY;

-- Leitura publica
CREATE POLICY "Public read episode_links" ON episode_links
  FOR SELECT USING (true);

-- Admin escrita
CREATE POLICY "Admin insert episode_links" ON episode_links
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin update episode_links" ON episode_links
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin delete episode_links" ON episode_links
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- Migrar dados existentes: copiar download_url dos episodes
-- para episode_links como idioma "Dublado" (padrao)
-- ============================================================
INSERT INTO episode_links (episode_id, language, download_url, file_size, quality)
SELECT id, 'Dublado', download_url, file_size, COALESCE(quality, '1080p')
FROM episodes
WHERE download_url IS NOT NULL AND download_url != ''
ON CONFLICT (episode_id, language, quality) DO NOTHING;
