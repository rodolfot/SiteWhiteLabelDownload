-- ============================================================
-- Fix: garantir que o role anon pode inserir nas tabelas de
-- comentarios, requisicoes e page_views
--
-- Problema: se o security-hardening.sql foi executado DEPOIS
-- da comments-migration.sql, o GRANT default pode ter sido
-- removido. Este script restaura as permissoes necessarias.
--
-- Executar no Supabase SQL Editor
-- ============================================================

-- 1. Garantir INSERT para anon nas tabelas que aceitam escrita publica
GRANT INSERT ON comments TO anon;
GRANT INSERT ON series_requests TO anon;
GRANT UPDATE ON series_requests TO anon; -- necessario para votos
GRANT INSERT ON page_views TO anon;

-- 2. Garantir SELECT para anon (leitura publica)
GRANT SELECT ON comments TO anon;
GRANT SELECT ON series_requests TO anon;

-- 3. Verificar: listar permissoes do anon (deve mostrar as grants acima)
SELECT grantee, table_name, privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon'
  AND table_schema = 'public'
  AND table_name IN ('comments', 'series_requests', 'page_views')
ORDER BY table_name, privilege_type;
